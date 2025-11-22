let seatSelect = [];

function getConcertId() {
    let url = window.location.href;
    let concertId = url.split("=")[1];
    return concertId;
}

function selectPrice(targetPrice) {
    let frame = theFrame();
    // let section = frame.getElementsByName("btnGrade");
    let sections = frame.querySelectorAll('p[name="btnGrade"]');
    console.log(sections);
    for (const btn of sections) {
        if (btn.innerText.includes(targetPrice)) {
            btn.click();
            return;
        }
    }
    if (targetPrice == null) {
        btn[0].click();
    }
}

async function selectSeat(areas) {
    for (const area of areas){
       clickOnArea(area);
       // TODO: insert pick grape code
       // integrated fuction getSeat();
       await sleep(1000) ;
       if (await getSeat()) {
        return true;
       }
    }
    // try {
    //     ChoiceEnd();
    // } catch(e) {
    //     let frame = theFrame();
    //     // const btn = frame.querySelector('a[href="javascript:ChoiceEnd();"]');
    //     // if (btn) {
    //     //     btn.click();
    //     // }
    //     // unsafeWindow.ChoiceEnd();
    //     disableEndButton();
    //     var script = frame.createElement('script');
    //     script.textContent = 'ChoiceEnd();';
    //     (frame.head || frame.body || frame.documentElement).appendChild(script);
    //     reactivateEndButton(); 
    //     script.remove();
    // }

}

function clickOnArea(area) {
    let frame = theFrame();
    // var sectionButton = frame.querySelector("ul.seat_layer > li");
    const items = frame.querySelectorAll('.seat_layer li');
    
    for (const item of items) {
        if (item.innerText.includes(area)) {
            item.click();
            return true;
        }
    }

//     if (sectionButton) {
//         sectionButton.click();
//     }
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
}

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
    console.log(document.getElementsByTagName("iframe"));
    selectPrice(data.price);
    selectSeat(data.section);
    // if (await getSeat()) {
    //     // reactivateEndButton();
    //     return;
    // }
    // console.log("no seat");
    // await sleep(1000);
    // // reload();
    // return; 
}

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
