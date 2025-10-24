let arrival = {hour: 9, minute: 0};
let STORAGE_FILE = "worktimer.json";

// Load saved time
function loadSavedTime() {
  try {
    let data = require("Storage").readJSON(STORAGE_FILE, 1);
    if (data && typeof data.hour=="number" && typeof data.min=="number")
      arrival = {hour:data.hour, minute:data.min};
  } catch(e){}
}

// Save time
function saveTime() {
  require("Storage").writeJSON(STORAGE_FILE, arrival);
}

// Format minutes to HH:MM AM/PM
function fmt(m) {
  let h = Math.floor(m/60);
  let min = m%60;
  let ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return h + ":" + ("0"+min).substr(-2) + " " + ampm;
}

// Show estimate screen as a menu
function showEstimatesMenu() {
  let arrivalTime = arrival.hour*60 + arrival.minute;
  let breakTime = (arrivalTime + 5*60) % (24*60);
  let leaveTime = (arrivalTime + 8*60) % (24*60);

  let m = {"": {title:"Work Schedule"}};
  m["Arrival: "+fmt(arrivalTime)] = ()=>{};
  m["Break:   "+fmt(breakTime)] = ()=>{};
  m["Leave:   "+fmt(leaveTime)] = ()=>{};
  m["Set Arrival Time"] = setArrivalTime;
  m["Exit"] = ()=>Bangle.showLauncher();

  E.showMenu(m);
}

// Adjust hour or minute
function adjustValue(title, value, max, step, callback) {
  let m = {"": {title:title + ": " + value}};
  m["+ Increase"] = ()=>{ value = (value+step)%max; adjustValue(title, value, max, step, callback); };
  m["- Decrease"] = ()=>{ value = (value-step+max)%max; adjustValue(title, value, max, step, callback); };
  m["Done"] = ()=>callback(value);
  E.showMenu(m);
}

// Set arrival time menu
function setArrivalTime() {
  let m = {"": {title:"Set Arrival"}};
  m["Hour: "+arrival.hour] = ()=>adjustValue("Hour", arrival.hour, 24, 1, v=>{ arrival.hour=v; setArrivalTime(); });
  m["Minute: "+arrival.minute] = ()=>adjustValue("Minute", arrival.minute, 60, 1, v=>{ arrival.minute=v; setArrivalTime(); });
  m["Confirm"] = ()=>{ saveTime(); showEstimatesMenu(); };
  m["Back"] = showEstimatesMenu;
  E.showMenu(m);
}

// Side button cancels to estimate screen
setWatch(()=>showEstimatesMenu(), BTN1, {repeat:true});

loadSavedTime();
showEstimatesMenu();
