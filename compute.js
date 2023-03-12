var firebaseConfig = {
    apiKey: "AIzaSyDeiWBansSR9ub3DkfxWnBnhP2flYCAaX8",
    authDomain: "predictions-00.firebaseapp.com",
    databaseURL: "https://predictions-00-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "predictions-00",
    storageBucket: "predictions-00.appspot.com",
    messagingSenderId: "714279605260",
    appId: "1:714279605260:web:ba468f952b79244b988a29",
    measurementId: "G-WK035SH0H0"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var auth = firebase.auth();

//Add/remove .html from url
const rootURL = window.location.origin;
const pageBaseURL = rootURL.includes("github") ? rootURL + "/prefute/" : rootURL;
var suffix = rootURL.includes("55") ? ".html" : "";
var prefix = rootURL.includes("github") ? '/prefute' : "";
var baseElm = document.createElement("base");
baseElm.href = pageBaseURL;
document.head.appendChild(baseElm);
const AElms = document.querySelectorAll("a");
AElms.forEach(elm => {
    if(rootURL.includes("55")) return;
    elm.href = elm.href.split(".html")[0];
})

//Report A Problem
const reportDialog = document.getElementById("report-dialog");


//Show/ Close Report Modal
const reportAnchor = document.querySelectorAll(".reportAnchor");
reportAnchor.forEach(btn => btn.addEventListener('click', () => reportDialog.showModal()));

const cancelReportModal = document.getElementById("cancel-report-modal");
const exitReportModal = document.getElementById("exit-report-modal");
cancelReportModal.addEventListener('click', () => reportDialog.close());
exitReportModal.addEventListener('click', () => reportDialog.close());

//Dropdown menu toggle
const dropdown = document.getElementById("dropdown");
const dropdown_menu = document.getElementById("dropdown-menu");
const main = document.querySelector("main");

dropdown.addEventListener('click', () => {
    dropdown_menu.classList.toggle("menu-open");
    main.classList.toggle("menu-open");
});
main.addEventListener('click', () => {
    dropdown_menu.classList.toggle("menu-open", false);
    main.classList.toggle("menu-open", false);
}); 

//Page Shortcuts
document.addEventListener('keydown', keydown => {
    if(keydown["altKey"]){
        switch(keydown.key){
            case "1": 
                window.location.href = pageBaseURL+"/";
                break;
            case "2":
                window.location.href = pageBaseURL+"/about"+suffix;
                break;
            case "3":
                window.location.href = pageBaseURL+"/search"+suffix;
                break;
            case "4":
                window.location.href = pageBaseURL+"/new"+suffix;
                break;
            case "5":
                window.location.href = pageBaseURL+"/account"+suffix;
                break;
            case "6":
                reportDialog.showModal();
                break;
        }
    }
})

window.location.href = pageBaseURL+"/maintanace"+suffix