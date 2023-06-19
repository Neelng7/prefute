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
var storage = firebase.storage().ref();

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


//Reports
const reportDialog = document.getElementById("report-dialog");
const reportAnchor = document.querySelectorAll(".reportAnchor");
reportAnchor.forEach(btn => btn.addEventListener('click', () => {
    if(auth.currentUser == null) window.location.href = pageBaseURL + "/account" + suffix + "?report-rd";
    else reportDialog.showModal()
}));

const cancelReportModal = document.getElementById("cancel-report-modal");
const exitReportModal = document.getElementById("exit-report-modal");
const reportSummary = document.getElementById("report-summary");
const reportDetails = document.getElementById("report-details");
const reportScreenshot = document.getElementById("report-screenshot");
const submitReport = document.getElementById("submit-report");
const alertReport = document.getElementById("report-alert");

cancelReportModal.addEventListener('click', cancelReport);
exitReportModal.addEventListener('click', cancelReport);

function cancelReport(){
    reportSummary.value = "";
    reportDetails.value = "";
    reportScreenshot.value = null;
    alertReport.textContent = ""
    submitReport.removeAttribute("disabled");
    reportDialog.close();
}

submitReport.addEventListener('click', () => {
    //get reports count
    var countRef = database.ref('/reports/reportCount')
    countRef.once("value", data => {
        var count = data.val() + 1;
        var file = reportScreenshot.files[0];

        if(reportSummary.value.trim().length < 5){
            alertReport.innerHTML = "Enter a valid report summary<br>"
            reportSummary.focus();
        }
        else if(reportDetails.value.trim().length < 10){
            alertReport.innerHTML = "Enter valid details<br>"
            reportDetails.focus();
        }
        else if(file && !(file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png")){
            alertReport.innerHTML = "File type is invalid<br>Uploaded file is not an image."
            reportScreenshot.value = "";
        }
        else reportProblem(count);
    })
})

async function reportProblem(count){
    var user = auth.currentUser;
    var file = reportScreenshot.files[0];
    let urlRef = null;

    submitReport.setAttribute("disabled", '');
    alertReport.innerHTML = ""

    if(file){
        const fileName = `/reports/report${count}_${new Date()}_${user.uid}`
        const metadata = { contentType: file.type };
    
        try{
            const snapshot = await storage.child(fileName).put(file, metadata);
            urlRef = await snapshot.ref.getDownloadURL();
        }
        catch(error){ console.log(error); }
    }

    await database.ref('/reports/report'+count).set({
        user: user.uid,
        imageURL: urlRef,
        summary: reportSummary.value,
        details: reportDetails.value,    
    })

    await database.ref('/reports/').update({
       reportCount: count 
    })

    alert("Problem Reported");
    cancelReport();
}


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
