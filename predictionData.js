if(window.location.search == "") window.location.href = pageBaseURL+prefix+"/404"+suffix;
const pageTitle = document.querySelector("title");
pageTitle.textContent = "Prefute - " + window.location.search.slice(1,);

const accountPic = document.querySelector(".account-picture");
const accountName = document.getElementById("account-name");
const accountUsername = document.getElementById("account-username");
const profileRedirect = document.getElementById("profile");

const predictionWrapper = document.querySelector(".prediction-wrapper");
const editingOptionsSec = document.querySelector(".edit-section");
const lineSeparator = document.querySelector(".line-seperator");
const loadingIcon = document.getElementById("load");
const notReleasedFieldset = document.getElementById("notReleased");
const predictionPasswordContainer = document.getElementById("prediction-password-verification");
const notReleasedWrapper = document.querySelector(".not-released-wrapper");
const predictionId_h3 = document.getElementById("prediction-id");
const uploadDateSpan = document.getElementById("upload-date");
const releaseDateSpan = document.getElementById("release-date");
const mainPredictionTextarea = document.getElementById("main-prediction");

const predictionCardContainer= document.querySelector("[data-prediction-cards-container]");
const publicPredictionsCount = document.getElementById("public-predictions-count");
const privatePredictionsCount = document.getElementById("private-predictions-count");
const noPredictionsPara = document.getElementById("no-predictions-account");
const userCardTemplate= document.querySelector("[data-predictions-template]");
var publicPredictionsCountRef = 0, privatePredictionsCountRef = 0;
var userUID, userData, predictionData, myUID, predictionId, passwordDB;
var isOwner = false;

const URLparameters = new URLSearchParams(window.location.search);
if(URLparameters.has('user')){
    userUID = URLparameters.get('user');
    predictionId = URLparameters.get('id');
    pageTitle.textContent = "Prefute - " + predictionId;
    predictionId_h3.textContent = predictionId;
    displayUserData(userUID);
    retrieveData();
}else window.location.href = `${prefix}/404${suffix}`

var content = {prefuteID: predictionId}
const viewProfile = document.getElementById("view-profile");
const editPredictionBtn = document.getElementById("edit-prediction");
const cancelEditBtn = document.getElementById("cacel-edit");
if(viewProfile) viewProfile.addEventListener('click', () => window.location.href = `${prefix}/user${suffix}?${userUID}`);

auth.onAuthStateChanged(user => {
    if(!user) return;
    myUID = user.uid;
    if(auth.currentUser) isOwner = userUID == auth.currentUser.uid;
    if(userUID == myUID){
        viewProfile.remove()
        editPredictionBtn.classList.toggle("hide", false);
    }else {
        editPredictionBtn.remove();
        cancelEditBtn.remove();
    }
}); 

//Enter Button
document.addEventListener('keydown', (click) => {
    if(click.key == "Enter" && document.activeElement == password) passwordSubmit.click();
})

async function retrieveData(){
    var publicDataRef  = database.ref(`/users/${userUID}/${predictionId}/public`);
    await publicDataRef.once("value", data => {
        var publicData = data.val()
        if(!publicData) window.location.href = `${prefix}/404${suffix}`
        content = Object.assign({}, content, publicData);
    })
    var privateDataRef  = database.ref(`/users/${userUID}/${predictionId}/private`);
    await privateDataRef.once("value", data => {
        var privateData = data.val()
        if(!privateData) window.location.href = `${prefix}/404${suffix}`
        content = Object.assign({}, content, privateData);
    })
    var prefuteDataRef  = database.ref(`/users/${userUID}/${predictionId}/predictionData`);
    await prefuteDataRef.once("value", data => {
        var prefuteData = data.val()
        if(prefuteData) content = Object.assign({}, content, prefuteData);
    }).catch(() => {})
    if(isOwner){
        var passwordDataRef  = database.ref(`/users/${userUID}/${predictionId}/password`);
        await passwordDataRef.once("value", data => {
            var passwordData = data.val()
            if(passwordData) content = Object.assign({}, content, passwordData);
        })
    } displayPrediction();
}


function displayPrediction(){
    predictionWrapper.classList.remove("hide");
    loadingIcon.remove();
    lineSeparator.classList.toggle("hide", true);

    const Local_UploadDate = new Date(new Date(content.uploadDate));
    const Local_UplaodTime = Local_UploadDate.toTimeString().split(":");
    uploadDateSpan.textContent = `This Prefute was uploaded on 
        ${Local_UploadDate.toDateString()}, at ${Local_UplaodTime[0]}:${Local_UplaodTime[1]}`;
    
    const Local_ReleaseDate = new Date(new Date(content.releaseTimestamp));
    const Local_ReleaseTime = Local_ReleaseDate.toTimeString().split(":");

    if(Local_ReleaseDate <= new Date()){
        releaseDateSpan.textContent = `This Prefute was released on
            ${Local_ReleaseDate.toDateString()}, at ${Local_ReleaseTime[0]}:${Local_ReleaseTime[1]}`;

        if(!content.isPublic){
            if(!auth.currentUser) window.location.href = pageBaseURL+`${prefix}/account${suffix}?private-rd-?id=${predictionId}&user=${userUID}`;
            if(isOwner){
                mainPredictionTextarea.textContent = content.prediction;
                notReleasedFieldset.remove();                    
            }else{
                mainPredictionTextarea.classList.toggle("hide", true);
                if(predictionPasswordContainer) predictionPasswordContainer.classList.toggle("hide", false);
                notReleasedWrapper.classList.toggle("hide", true);
            }
        }else{
            mainPredictionTextarea.textContent = content.prediction;
            notReleasedFieldset.remove();
        }
    }else{
        releaseDateSpan.textContent = `This Prefute will be released on
            ${Local_ReleaseDate.toDateString()}, at ${Local_ReleaseTime[0]}:${Local_ReleaseTime[1]}`;
        releaseDateSpan.style.color = "red";
        if(isOwner){
            mainPredictionTextarea.textContent = content.prediction;
            notReleasedFieldset.remove();
        }else mainPredictionTextarea.classList.toggle("hide", true);
    }
    if(isOwner){
        displayEditDetailts();
        saveEditedChanges();
    }
}


function displayUserData(userUID){
    var userRef  = database.ref(`/users/${userUID}/userData`);
    userRef.once("value", data => {
        userData = data.val();
        if(userData == null) window.location.href = pageBaseURL+prefix+"/404"+suffix;

        var displayName_formated = [];
        var displayName = userData.displayName.split(" ");
        displayName.forEach(e => displayName_formated.push(e.slice(0,1).toUpperCase() + e.slice(1,)));

        accountPic.src = "https://prefute.com/images/userProfilePicDefault.png";
        accountPic.src = userData.photoURL;
        accountName.textContent =  displayName_formated.join(" ").trim();
        accountUsername.textContent = userData.username;
        profileRedirect.href = `${prefix}/user${suffix}?${userUID}`;
        publicPredictionsCount.textContent = userData.public;
        privatePredictionsCount.textContent = userData.private;
        content.public = userData.public;
        content.private = userData.private;
    })
}

const passwordReveal = document.querySelector(".password-reveal");
const password = document.getElementById("password-verification-inp");
const passwordSubmit = document.getElementById("password-submit");
const passwordAlert = document.getElementById("password-alert")

if(passwordReveal) passwordReveal.addEventListener('click', () => {
    passwordReveal.classList.toggle("fa-eye");
    passwordReveal.classList.toggle("fa-eye-slash");
    password.type = password.type == "password" ? "text" : "password";
});

if(passwordSubmit) passwordSubmit.addEventListener('click', () => {
    database.ref(`/users/${auth.currentUser.uid}/userData/`).update({
        [predictionId]: password.value
    }).then(() => {
        var prefuteDataRef  = database.ref(`/users/${userUID}/${predictionId}/predictionData`);
        prefuteDataRef.once("value", data => {
            var prefuteData = data.val()
            if(prefuteData) content = Object.assign({}, content, prefuteData);
        })
        .then(() => {
            mainPredictionTextarea.textContent = content.prediction;
            notReleasedFieldset.remove();
            mainPredictionTextarea.classList.remove("hide");
            database.ref(`/users/${auth.currentUser.uid}/userData/${predictionId}`).remove();
        })
        .catch(err => {
            if(err.message.includes('permission_denied')) passwordAlert.textContent = "Password is invalid";
            else passwordAlert.textContent = "Error! Please try again.";
            password.focus();
            database.ref(`/users/${auth.currentUser.uid}/userData/${predictionId}`).remove();
        })
    })
})

const predictionVisibility = document.getElementById("prediction-visibility");
const publicContainer = document.querySelector(".public");
const privateContainer = document.querySelector(".private");

predictionVisibility.addEventListener('change', () => {
    publicContainer.classList.toggle("hide");
    privateContainer.classList.toggle("hide");
})

//Edit section
const subheading = document.getElementById("subheading");
const releaseDate_edit = document.getElementById("release-date-edit");
const releaseTime_edit = document.getElementById("release-time");
const visibility_edit = document.getElementById("prediction-visibility");
const publicTags_edit = document.getElementById("public-tags");
const password_edit = document.getElementById("password-edit");
const editElms = document.querySelectorAll(".edit");
const saveEditedChangesBtn = document.getElementById("save-edited-changes");
var isEdited = false

const copyLink = document.getElementById("copy-link");
if(copyLink) copyLink.addEventListener('click', () => {;
    window.navigator.clipboard.writeText("https://prefute.com/prediction"+window.location.search);
    copyLink.textContent = "Copied!";
    setTimeout(() => {copyLink.innerHTML = 'Copy <i class="fa-solid fa-copy"></i'}, 3000);
})

if(cancelEditBtn) cancelEditBtn.addEventListener('click', () => {
    if(!isEdited) cancelEditSec();
    else if(confirm("Leave unsaved changes?")){
        displayEditDetailts();
        cancelEditSec();
    }
})

function cancelEditSec(){
    subheading.textContent = "";
    lineSeparator.classList.toggle("hide", true);
    predictionWrapper.style.border = "1px solid black";
    cancelEditBtn.classList.toggle("hide", true);
    editPredictionBtn.classList.toggle("hide", false);
    editingOptionsSec.classList.toggle("hide", true);
    editPasswordReveal.classList.toggle("fa-eye", true);
    editPasswordReveal.classList.toggle("fa-eye-slash", false);
    password_edit.type = "password";
}

if(editPredictionBtn) editPredictionBtn.addEventListener('click', () => {
    subheading.textContent = "Edit Prediction";
    lineSeparator.classList.toggle("hide", false);
    predictionWrapper.style.border = "none";
    cancelEditBtn.classList.toggle("hide", false);
    editPredictionBtn.classList.toggle("hide", true);
    editingOptionsSec.classList.toggle("hide", false);
})

function displayEditDetailts(){
    predictionPasswordContainer.remove();
    const Local_ReleaseDate = new Date(content.releaseTimestamp);
    const Local_ReleaseTime = Local_ReleaseDate.toTimeString().split(":");  

    releaseDate_edit.value = Local_ReleaseDate.toISOString().split("T")[0];
    releaseTime_edit.value = Local_ReleaseTime[0] +":"+ Local_ReleaseTime[1];
    if(!content.isPublic){
        visibility_edit.value = "Private";
        publicContainer.classList.toggle("hide", true);
        privateContainer.classList.toggle("hide", false);
        password_edit.value = content.password;
    }else publicTags_edit.value = content.tags;
}

const editPasswordReveal = document.querySelector(".password-reveal#reveal-edit");
editPasswordReveal.addEventListener("click", () => {
    editPasswordReveal.classList.toggle("fa-eye");
    editPasswordReveal.classList.toggle("fa-eye-slash");
    password_edit.type = password_edit.type == "password" ? "text" : "password";
})

function saveEditedChanges(){
    editElms.forEach(inp => {
        inp.addEventListener('change', () => { isEdited = true });
    })
    saveEditedChangesBtn.addEventListener('click', uploadData);
}

async function uploadData(){

    var publicCount = content.public
    var privateCount = content.private

    var isPublic = visibility_edit.value == "Public"
    if(isPublic){
        password.value = "";
        publicCount += 1;
        privateCount -= 1
    }else{
        privateCount += 1;
        publicCount -= 1;
    }

    if(isPublic) password_edit.value = "";
    else if(visibility_edit.value == "Private"){
        if(password_edit.value == "" || password_edit.value.includes(" ")){
            alert("Please enter a valid password");
            password_edit.focus();
            return;
        }
    }
    var releaseDateModified = new Date(releaseDate_edit.value+"T"+releaseTime_edit.value).toGMTString();

    await database.ref(`/users/${userUID}/${predictionId}/password`).set({
        password: password_edit.value
    });
    await database.ref(`/users/${userUID}/${predictionId}/public`).update({
        releaseTimestamp: new Date(releaseDateModified).getTime(),
        isPublic: isPublic,
    });
    await database.ref(`/users/${userUID}/userData`).update({
        public: publicCount,
        private: privateCount
    });
    if(isPublic) await database.ref(`/users/${userUID}/${predictionId}/public`).update({
        tags: publicTags_edit.value
    });
    console.log("Prefute Edited");
    window.location.reload();
}

//delete Prediction
const deletePredictionBtn = document.getElementById("delete-prediction");
if(deletePredictionBtn) deletePredictionBtn.addEventListener('click', deletePrediction)

async function deletePrediction(){

    var publicCount = content.public
    var privateCount = content.private

    if(content.isPublic) publicCount -= 1;
    else privateCount -= 1;

    var conformation = prompt("Enter Prefute Id to delete Prefute");
    if(conformation != null){
        if(conformation == predictionId){
            await database.ref(`/users/${auth.currentUser.uid}/${predictionId}/public`).remove();
            await database.ref(`/users/${auth.currentUser.uid}/${predictionId}`).remove();
            await database.ref(`/data/${predictionId}`).remove();

            await database.ref(`/users/${userUID}/userData`).update({
                public: publicCount,
                private: privateCount
            });
    
            console.log("Prefute Deleted");
            alert("Prefute Deleted");
            window.location.href = pageBaseURL+"/account"+suffix;

        }else{
            alert("Prefute Id is incorrect\nPrefute not deleted");
        }
    }
}


//check if passs is correct in firebae only - them read and write should be user uid == uid

//Rules
// add read access if password is correct
// firbase: uid: password
// rules: if ...parent().child(auth.uid).val() == password.val() ....
//data write

// only read prediction password if auth.uid == user.uid

