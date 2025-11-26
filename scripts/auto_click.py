import pyautogui
import numpy as np
import tkinter as tk
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import cv2
import pytesseract

# --- Initialization ---
print("Initializing auto clicker...")
img = pyautogui.screenshot()
width, height = img.size
root = tk.Tk()
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
scale_factor_width = int(width / screen_width)
scale_factor_height = int(height / screen_height)
print("Screen scale factor width, height:", scale_factor_width, scale_factor_height)
half_width = width // 2
half_height = height // 2
# Seating map area
start_x = 0
end_x = 740
start_y = 200
end_y = 500
root.destroy()
app = Flask(__name__)
CORS(app, origins=['http://localhost:1057', 'https://ticket.yes24.com'])
complete_x = None
complete_y = None

# Define a range for "gray" in HSV (low saturation)
lower_gray = np.array([0, 0, 0])  # Example: low saturation, moderate value
upper_gray = np.array([180, 20, 255]) # Example: low saturation, moderate value

def seach_complete_button():
    try:
        screen_shot = pyautogui.screenshot(region=(half_width//scale_factor_width, half_height//scale_factor_height, 
                                                width//scale_factor_width, height//scale_factor_height)).convert('RGB')
        gray_img = cv2.cvtColor(np.asarray(screen_shot), cv2.COLOR_RGB2GRAY)
        _, thresh_regions = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        detected_text = pytesseract.image_to_data(thresh_regions, config='--psm 6', output_type=pytesseract.Output.DATAFRAME) # psm 6 for single uniform block of text
        labels = ['left', 'top', 'width', 'height']
        coord = [detected_text.loc[detected_text['text'] == 'completed', l].iloc[0] for l in labels]
        click_x = (half_width + coord[0] + (coord[2] // 2)) // scale_factor_width
        click_y = (half_height + coord[1]) // scale_factor_height
        return click_x, click_y
    except:
        return None, None

# ==============================================================================
#      FLASK API ENDPOINT
# ==============================================================================
@app.route('/auto_click', methods=['POST'])
def auto_click():
    try:
        global complete_x
        global complete_y
        if not (complete_x or complete_y):
            complete_x, complete_y = seach_complete_button()
            if not (complete_x or complete_y):
                raise ValueError("Failed to find complete button")
        seating_map_sc = pyautogui.screenshot(region=(start_x, start_y, end_x, end_y)).convert('RGB')
        seating_map = np.asarray(seating_map_sc)
        hsv = cv2.cvtColor(seating_map, cv2.COLOR_RGB2HSV)
        # Create a mask for gray pixels
        mask_gray = cv2.inRange(hsv, lower_gray, upper_gray)
        # Invert the mask to get non-gray pixels
        mask_nongray = cv2.bitwise_not(mask_gray)
        result_nongray = cv2.bitwise_and(seating_map, seating_map, mask=mask_nongray)
        matches = np.all(result_nongray != [0, 0, 0], axis=-1)
        if matches.any():
            print("get")
            # Get the coordinates of the matches
            match_coords = np.argwhere(matches)[0]
            pyautogui.leftClick(x=(match_coords[1]+start_x), y=(match_coords[0]+start_y))
            pyautogui.leftClick(x=complete_x, y=complete_y)
            time.sleep(0.5)
            pyautogui.leftClick(x=complete_x, y=complete_y)
            return jsonify({'text': "clicked"})
        return jsonify({'text': "floor"})
    except ValueError as e:
        return jsonify({'text': "seating map not loaded", 'message': str(e)})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'An internal server error occurred', 'message': str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=1057)