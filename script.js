let swInt, swTime = 0, tmInt, audioCtx, osc;
let careerPage = 0, answers = new Array(30).fill(null);
let scheduleData = [], historyData = [];

const careers = ["Software Engineer","Architect","Surgeon","Astronaut","Artist","Teacher","Lawyer","Athlete","Chef","Robotist","Investor","Director","Musician","Historian","Fashion Designer","Park Ranger","CEO","Detective","Photographer","Pro Gamer","Author","Farmer","Politician","Deep Sea Diver","Civil Engineer","Event Planner","Researcher","Interior Designer","Vet","Pilot"];
const emojis = ['😡','🙁','😐','🙂','😁'];

function navigate(id) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) {
        target.classList.add('active');
        target.style.display = 'flex';
        if(id === 'career-page') renderCareer();
    }
}

function runAi() {
    const inp = document.getElementById('ai-cmd');
    const cmd = inp.value.toLowerCase().trim();
    const chat = document.getElementById('ai-chat');
    let res = "Aether: Command not recognized.";

    if (cmd.includes("timer") && cmd.includes("4") && cmd.includes("second")) {
        document.getElementById('th').value = 5;
        handleTimerStart();
        res = "Special logic: Setting a 5-hour timer.";
    } 
    else if (cmd.includes("alarm") && cmd.includes("sunday")) {
        res = "Aether: Sunday alarm is now active.";
    }
    else if (cmd.includes("date")) {
        res = "Date: " + new Date().toDateString();
    }
    else if (cmd.includes("time")) {
        res = "Time: " + new Date().toLocaleTimeString();
    }
    else if (cmd.includes("go to") || cmd.includes("open")) {
        if (cmd.includes("schedule")) { navigate('schedule-page'); res = "Opening Schedule."; }
        else if (cmd.includes("clock")) { navigate('full-clock-page'); res = "Opening Clock."; }
        else if (cmd.includes("home")) { navigate('home-page'); res = "Going home."; }
    }
    else if (cmd.includes("clear history")) { clearHistory(); res = "History wiped."; }

    chat.innerHTML += `<div style="align-self:flex-start; background:#eee; padding:8px; border-radius:10px;"><b>You:</b> ${inp.value}</div>
                       <div style="align-self:flex-end; background:#d1ffd1; border:1px solid green; padding:8px; border-radius:10px;"><b>Aether:</b> ${res}</div>`;
    inp.value = ""; chat.scrollTop = chat.scrollHeight;
}

function showCareerModal(type) {
    const modal = document.getElementById('career-modal');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const btns = document.getElementById('modal-buttons');
    const answeredCount = answers.filter(a => a !== null).length;
    btns.innerHTML = ""; modal.classList.add('active');

    if (type === 'later') {
        title.innerText = "Save Progress?";
        text.innerText = "Do you want to save and leave?";
        btns.innerHTML = `<button onclick="closeModal()">CANCEL</button>
                          <button style="background:#39ff14;" onclick="navigate('home-page'); closeModal()">SAVE PROGRESS AND EXIT</button>`;
    } else {
        if (answeredCount < 10) {
            title.innerText = "Notice";
            text.innerText = "Answer 10+ for results. Finish anyway?";
            btns.innerHTML = `<button onclick="closeModal()">CANCEL</button>
                              <button style="background:#ff4444; color:white;" onclick="navigate('home-page'); closeModal()">FINISH ANYWAY</button>`;
        } else {
            title.innerText = "Complete!";
            btns.innerHTML = `<button onclick="navigate('home-page'); closeModal()">FINISH</button>`;
        }
    }
}
function closeModal() { document.getElementById('career-modal').classList.remove('active'); }

setInterval(() => {
    const n = new Date();
    const timeStr = n.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    ['hub-main-time', 'sc-main'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = timeStr; });
    if(document.getElementById('sc-date')) document.getElementById('sc-date').innerText = n.toDateString().toUpperCase();
    scheduleData.forEach(item => {
        if (item.time === timeStr.substring(0, 5) && !item.fired) { item.fired = true; triggerAlarm(); }
    });
}, 1000);

function triggerAlarm() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator(); osc.connect(audioCtx.destination); osc.start();
    const btn = document.getElementById('stop-alarm'); btn.style.display = 'block';
    btn.onclick = () => { if(osc) osc.stop(); btn.style.display = 'none'; };
    logClockAction("ALARM TRIGGERED"); navigate('full-clock-page');
}

function handleTimerStart() {
    let s = (parseInt(document.getElementById('th').value)||0)*3600 + (parseInt(document.getElementById('tm').value)||0)*60 + (parseInt(document.getElementById('ts').value)||0);
    if(s > 0) {
        logClockAction("Timer Set: " + s + "s");
        clearInterval(tmInt);
        tmInt = setInterval(() => {
            s--;
            let h = Math.floor(s/3600).toString().padStart(2,'0'), m = Math.floor((s%3600)/60).toString().padStart(2,'0'), sec = (s%60).toString().padStart(2,'0');
            document.getElementById('timer-display').innerText = `${h}:${m}:${sec}`;
            if(s <= 0) { clearInterval(tmInt); triggerAlarm(); }
        }, 1000);
    }
}

function renderCareer() {
    const grid = document.getElementById('career-grid'); grid.innerHTML = "";
    for(let i=0; i<10; i++) {
        let idx = (careerPage*10)+i;
        grid.innerHTML += `<div class="q-row"><span>${idx+1}. ${careers[idx]}</span><div class="emoji-btns">
            ${emojis.map((e, v) => `<span onclick="setAns(${idx},${v})" class="${answers[idx]===v?'active':''}">${e}</span>`).join('')}
        </div></div>`;
    }
    document.getElementById('cp-num').innerText = (careerPage + 1) + " / 3";
}
window.setAns = (idx, v) => { answers[idx] = v; renderCareer(); };
function changeCareerPage(dir) { careerPage = Math.max(0, Math.min(2, careerPage + dir)); renderCareer(); }

function addSchedule() {
    const t = document.getElementById('sc-task').value, tm = document.getElementById('sc-time').value;
    if(t && tm) {
        scheduleData.push({task: t, time: tm, fired: false});
        document.getElementById('schedule-list').innerHTML += `<div class="q-row"><span><b>${tm}</b>: ${t}</span> <button class="remove-btn" onclick="this.parentElement.remove()">REMOVE</button></div>`;
        document.getElementById('sc-task').value = "";
    }
}
function addGoal() {
    const t = document.getElementById('g-task').value;
    if(t) {
        document.getElementById('goal-list').innerHTML += `<div class="q-row"><span>🎯 ${t}</span> <button class="remove-btn" onclick="this.parentElement.remove()">REMOVE</button></div>`;
        document.getElementById('g-task').value = "";
    }
}
function addWish() {
    const i = document.getElementById('w-item').value, w = document.getElementById('w-why').value;
    if(i) {
        document.getElementById('wish-list').innerHTML += `<div class="q-row"><span>⭐ ${i}</span> <button class="remove-btn" onclick="this.parentElement.remove()">REMOVE</button></div>`;
        document.getElementById('w-item').value = "";
    }
}
function startSw() {
    if(!swInt) {
        logClockAction("Stopwatch Started");
        let start = Date.now() - swTime;
        swInt = setInterval(() => {
            swTime = Date.now() - start;
            let t = Math.floor(swTime/1000);
            document.getElementById('sw-display').innerText = t + "s";
        }, 100);
    }
}
function stopSw() { clearInterval(swInt); swInt = null; }
function resetSw() { stopSw(); swTime = 0; document.getElementById('sw-display').innerText = "0s"; }

function logClockAction(m) {
    const msg = `[${new Date().toLocaleTimeString()}] ${m}`;
    historyData.unshift(msg);
    document.getElementById('history-content').innerHTML = historyData.map(h => `<div class="q-row">${h}</div>`).join('');
}
function clearHistory() { historyData = []; document.getElementById('history-content').innerHTML = ""; }
