let seatSelect = [];

function getConcertId() {
    let url = window.location.href;
    let concertId = url.split("=")[1];
    return concertId;
}

function openEverySection() {
    let frame = theFrame();
    let section = frame.getElementsByName("btnGrade");
    console.log(section);
    // for (let i = 0; i < section.length; i++) {
    //     section[i].click();
    // }
    section[0].click();
}

function clickOnArea(area) {
    let frame = theFrame();
    // let section = frame.getElementsByClassName("seat_layer");
    var sectionButton = frame.querySelector("ul.seat_layer > li");
    if (sectionButton) {
        sectionButton.click();
    }
    // for (let i = 0; i < section.length; i++) {
    //     let reg = new RegExp(area + "\$","g");
    //     if (section[i].innerHTML.match(reg)) {
    //         console.log("目前的section : ", section[i]);
    //         section[i].click();
    //         return;
    //     }
    //     else {
    //         section[0].click();
    //     }
    // }
}

async function getSeat() {
    const response = await fetch('http://127.0.0.1:1057/auto_click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
    });
    if (!response.ok) console.error(`Captcha API failed with status: ${response.status}`);
    const result = await response.json();
    const resultText = result.text;
    if (resultText == 'clicked') {
        return true;
    } else { return false; }
    
    // let frame = theFrame();
    //  seatArray = frame.getElementById("divSeatArray").children;
    // availableSeats = frame.querySelector('#divSeatArray .s9');
    // if (availableSeats) {
    //     var clickEvent = new Event('click', { bubbles: true });
    //     availableSeats[0].dispatchEvent(clickEvent);
    //     return true;
    // }

    // elementToClick = frame.getElementById('t2100059');
    // selectElement = window.frames[0].document.getElementById('t2200058');
    // selectElement.classList.replace('s9', 'son');
    // console.log(seatArray.length);
    // for (let i = 0; i < seatArray.length; i++) {
    //     // let seat = seatArray[i];
    //     if (seatArray[i].className === "s9") {
    //         seatArray[i].click();
    //         // await sleep(2000);
            // clickOnArea(frame.getElementsByClassName("booking")[0]);
            // var bookingLink = frame.getElementsByClassName("booking")[0];
            // // let bookingLink = frame.querySelector('img.booking');
            // bookingLink.parentElement.click();
    //         // reactivateEndButton();
    //         // await sleep(2000);
    //         return true;
    //     }
    //     console.log(seat.id);
    // }
    // return false;
}


// async function findSeat() {
//     let frame = theFrame();
//     let canvas = frame.document.getElementById("ez_canvas");
//     let seat = canvas.getElementsByTagName("rect");
//     console.log(seat);
//     await sleep(750);
//     for (let i = 0; i < seat.length; i++) {
//         let fillColor = seat[i].getAttribute("fill");
    
//         // Check if fill color is different from #DDDDDD or none
//         if (fillColor !== "#DDDDDD" && fillColor !== "none") {
//             console.log("Rect with different fill color found:", seat[i]);
//             var clickEvent = new Event('click', { bubbles: true });

//             seat[i].dispatchEvent(clickEvent);
//             frame.document.getElementById("nextTicketSelection").click();
//             return true;
//         }
//     }
//     return false;
// }

async function selectDate(data) {
    let date = data.date;
    let time = data.time;
    if (date) {
        document.getElementById(date).click();
        await sleep(200);
        if (time) {
            console.log("time", time);
            console.log(document.getElementsByTagName("li"));
            let lis = document.getElementsByTagName("li");
            for (let i = 0; i < lis.length; i++) {
                if (lis[i].innerText.includes(time)) {
                    lis[i].click();
                }
            }
        }
    }
    document.getElementById("btnSeatSelect").click();
}


function theFrame() {
    return window.frames[0].document;
}

function reload() {
    let frame = theFrame();
    // frame.getElementsByName("maphall")[0].children[0].click();
    location.reload(true);
    getSeat();
}


function disableEndButton() {
    const frame = theFrame();
    frame.getElementsByClassName("btn")[0].children[1].children[0].removeAttribute("href");
}

function reactivateEndButton() {
    let href = "javascript:ChoiceEnd();"
    const frame = theFrame();
    frame.getElementsByClassName("btn")[0].children[1].children[0].setAttribute("href", href);
}

async function searchSeat(data) {
    for (area of data.section) {
        // disableEndButton();
        console.log(document.getElementsByTagName("iframe"));
        openEverySection();
        clickOnArea(area);
        const clicked = await getSeat();
        if (clicked) {
            let bookingLink = window.frames[0].document.getElementsByClassName("booking")[0];
            // let bookingLink = frame.querySelector('img.booking');
            bookingLink.parentElement.click();
        }
        // if (await getSeat()) {
        //     // reactivateEndButton();
        //     return;
        // }
        console.log("no seat");
        await sleep(1000);
        // reload();
        return; 

    }
}

// async function searchSeat() {
//     let concertId = getConcertId();
//     let data = await get_stored_value(concertId);
//     await sleep(1000);
//     selectDate(data);
//     await sleep(1000);
//     findSeat();
// }

async function start() {
    await sleep(2000);
    console.log("STARTTTTT");
    // yes24 has no catchpa
    let concertId = getConcertId();
    let data = await get_stored_value(concertId);
    await sleep(1500);
    selectDate(data);
    await sleep(1000);
    searchSeat(data);
}

start();
