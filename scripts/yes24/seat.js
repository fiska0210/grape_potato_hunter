const HOST_NAME = "591CrawlerBot";
const WEBHOOK_URL = "https://discord.com/api/webhooks/1408177293901434890/k1GQa9PpqDLDbg--5U0cG8_mqFfMXtegzHga6ZVVkRvNpWDS_tJLl16oRdM1n7m-qoT3";

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
        if (targetPrice == null) {
            btn[0].click();
            return;
        }
        else if (btn.innerText.includes(targetPrice)) {
            btn.click();
            return;
        }
    }
}

async function selectSeat(areas) {
    for (const area of areas){
        var rnd_delay;
        clickOnArea(area);
        rnd_delay = getRandomInt(1000, 1500);
        await sleep(rnd_delay) ;
        if (await getSeat()) {
            return true;
        }
        await sleep(getRandomInt(500, 3000));
    }
    return false;
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
}

async function sendDiscordNotification(message) {
    await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    });
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
        const now = new Date();
        const timeString = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        await sendDiscordNotification(`[${HOST_NAME}]\n 時間 : ${timeString} 搶到票`);
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // 公式： (最大值 - 最小值 + 1) + 最小值
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    let findSeat = false;
    console.log(document.getElementsByTagName("iframe"));
    selectPrice(data.price);
    while (!findSeat) {
        // findSeat = selectSeat(data.section);
        if (await (selectSeat(data.section))) {
            console.log("Seat found and selected!");
            break;
        }
    }
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
