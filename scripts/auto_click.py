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
root.destroy()
app = Flask(__name__)
CORS(app, origins=['http://localhost:1057', 'https://ticket.yes24.com'])
complete_x = None
complete_y = None

def seach_complete_button():
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

# ==============================================================================
#      FLASK API ENDPOINT
# ==============================================================================
@app.route('/auto_click', methods=['POST'])
def auto_click():
    # data = request.get_json()
    # grape_color = [91, 203, 205]
    # grape_color = [78, 53, 213]
    grape_color = [140, 38, 194]
    try:
        global complete_x
        global complete_y
        time.sleep(0.5)
        seating_map_sc = pyautogui.screenshot(region=(0, 0, half_width//scale_factor_width, half_height//scale_factor_height)).convert('RGB')
        seating_map = np.asarray(seating_map_sc)
        matches = np.all(seating_map == grape_color, axis=-1)
        if matches.any():
            # Get the coordinates of the matches
            match_coords = np.argwhere(matches)[0]
            pyautogui.leftClick(x=match_coords[1], y=match_coords[0])
            if not (complete_x or complete_y):
                complete_x, complete_y = seach_complete_button()
            pyautogui.leftClick(x=complete_x, y=complete_y)
            time.sleep(0.5)
            pyautogui.leftClick(x=complete_x, y=complete_y)
            return jsonify({'text': "clicked"})
        return jsonify({'text': "floor"})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'An internal server error occurred', 'message': str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=1057)