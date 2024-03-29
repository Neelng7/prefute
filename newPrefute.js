auth.onAuthStateChanged(user => {
    if(!user) window.location.href = pageBaseURL+`${prefix}/account${suffix}?new-rd`;
});

//Toggle public/private visibility
const prefuteVisibility = document.getElementById("prefute-visibility");
const publicContainer = document.querySelector(".public");
const privateContainer = document.querySelector(".private");

prefuteVisibility.addEventListener('change', () => {
    publicContainer.classList.toggle("hide");
    privateContainer.classList.toggle("hide");
})

var today = new Date();
//convert timestamp to date by
new Date("timestamp");

// var date = new Date("2022-4-5T18:48+05:30") > new Date("2022-04-05T18:47+04:00");
// Above date is 5th April 2022, at 6:48 PM, and it will convert the time from GMT+04:00 to GMT+05:30(a.k.a IST);

// All dates (upload + release) are converted are stored in GMT
// So not upload timezone - only release
//timediff is just calculated by adding/subtracting the GMT diff of the current timezone
/* GMT and UTC are the same:
    getTimezoneOffset() returns the difference between UTC time and local time.
    getTimezoneOffset() returns the difference in minutes.
    For example, if your time zone is GMT+2, -120 will be returned.
    eg var currentDiff = new Date().getTimezoneOffset();    return -330, so -330/-60 = 5.5
*/
//new Date().toDateString(); && new Date().toLocaleTimeString(); to get a display date.
//var localTimezone = "(" + new Date().toString().split("(")[1];

const newprefuteContainer = document.querySelector(".new-prefute-container");
const containerAlert = document.getElementById("alert");
const newprefuteSubmit = document.getElementById("new-prefute-submit");
const prefuteID = document.getElementById("prefuteID");
const prefute = document.getElementById("prefute");
const releaseDate = document.getElementById("release-date");
const releaseTime = document.getElementById("release-time");
const publicTags = document.getElementById("public-tags");
const password = document.getElementById("password");
var prohibitedSymbols = [".", "#", "$", "/", "[", "]", "\\", "@", "+", "=", "!"];
var prefuteIDs = [], tomorrow = today, users;
var publicCount = 0, privateCount = 0;

releaseDate.setAttribute("min", today.toISOString().split("T")[0]);
tomorrow.setDate(tomorrow.getDate() + 1);
releaseDate.value = tomorrow.toISOString().split("T")[0];
releaseTime.value = "00:00";

//Get all prefute IDs
var usersRef  = database.ref('/data/');
usersRef.once("value",(data) => {
    users = data.val();
    for (const [idx, value] of Object.entries(users)) prefuteIDs.push(idx);
})

//Enter Button
document.addEventListener('keydown', (click) => {
    if(click.key == "Enter"){
        switch(document.activeElement){
            case publicTags: newprefuteSubmit.click(); break;
            case password: newprefuteSubmit.click(); break;
            default: break;
        }
    }
})

newprefuteSubmit.addEventListener('click', () => {
    var stopFn = 0
    prohibitedSymbols.forEach(e => {
        if(prefuteID.value.includes(e)){
            containerAlert.innerHTML = `Prefute Id is invalid.<br> Prefute Id cannot contain "${e}"`;
            prefuteID.focus();
            stopFn -= 1;
        }else stopFn += 1;
    })
    if(stopFn != prohibitedSymbols.length);
    else if(prefuteID.value.trim() == ""){
        containerAlert.textContent = "Enter a Prefute Id";
        prefuteID.focus();
    }else if(prefuteID.value.includes(" ")){
        containerAlert.textContent = "Prefute Id cannot contain a space";
        prefuteID.focus(); 
    }else if(prefute.value.trim() == ""){
        containerAlert.textContent = "Enter a prefute";
        prefute.focus();
    }else if(releaseDate.value == ""){
        containerAlert.textContent = "Enter the release date";
        releaseDate.focus();
    }else if(releaseTime.value == ""){
        containerAlert.textContent = "Enter the release time";
        releaseTime.focus();
    }else if(prefuteVisibility.value == "Private" && password.value == ""){
        containerAlert.textContent = "Please enter a password";
        password.focus();
    }else if(prefuteVisibility.value == "Private" && password.value.includes(" ")){
        containerAlert.textContent = "Password cannot contain a space";
        password.focus();
    }else if(prefuteIDs.includes(prefuteID.value.trim())){
        containerAlert.innerHTML = "Prefute Id is already taken.<br> Please enter a unique ID.";
        prefuteID.focus();
    }else uploadData();
})

async function uploadData(){

    var userUID = auth.currentUser.uid
    var countRef = database.ref(`users/${userUID}/userData/`);
    await countRef.once("value", data => {
        var userData = data.val();
        publicCount = userData.public
        privateCount = userData.private
    });

    var isPublic = prefuteVisibility.value == "Public"
    if(isPublic){
        password.value = "";
        publicCount += 1;
    }else privateCount += 1;

    var today = new Date();
    var releaseDateModified = new Date(releaseDate.value+"T"+releaseTime.value).toGMTString();
    var uploadDateModified = today.toGMTString();

    await database.ref("/data/").update({
        [prefuteID.value]: userUID
    });
    await database.ref(`/users/${userUID}/userData`).update({
        public: publicCount,
        private: privateCount
    });
    await database.ref(`/users/${userUID}/${prefuteID.value}/private`).set({
        uploadDate: new Date(uploadDateModified).getTime()
    });
    await database.ref(`/users/${userUID}/${prefuteID.value}/password`).set({
        password: password.value
    });
    await database.ref(`/users/${userUID}/${prefuteID.value}/prefuteData`).set({
        prefute: prefute.value
    });
    await database.ref(`/users/${userUID}/${prefuteID.value}/public`).set({
        releaseTimestamp: new Date(releaseDateModified).getTime(),
        tags: publicTags.value, 
        isPublic: isPublic
    });

    console.log("Prefute Uploaded.")
    alert("Prefute Uploaded");
    window.location.href = pageBaseURL+`${prefix}/account${suffix}`;
}
