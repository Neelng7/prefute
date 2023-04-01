const accountPic = document.querySelector(".account-picture");
const accountName = document.getElementById("account-name");
const accountUsername = document.getElementById("account-username");
const pageTitle = document.querySelector("title");
const profileRedirect = document.getElementById("profile");
const addToFavorites = document.getElementById("add-to-favorites");
const removeFromFavorites = document.getElementById("remove-from-favorites");
const noPredictions = document.querySelector(".noPrediction"); 

const predictionCardContainer= document.querySelector("[data-prediction-cards-container]");
const publicPredictionsCount = document.getElementById("public-predictions-count");
const privatePredictionsCount = document.getElementById("private-predictions-count");
const noPredictionsPara = document.getElementById("no-predictions-account");
const userCardTemplate= document.querySelector("[data-predictions-template]");
var publicPredictionsCountRef = 0, privatePredictionsCountRef = 0;
var userPredictions, userDisplayname, favouritesData;

if(window.location.search == "") window.location.href = pageBaseURL+prefix+"/404"+suffix;
const userUID = window.location.search.slice(1,);
auth.onAuthStateChanged(user => {
    if(!user) window.location.href = `${prefix}/account${suffix}?profile-rd-${userUID}`;
    if(window.location.search.includes(user.uid)) window.location.href = pageBaseURL+prefix+"/account"+suffix;
    displayUserData(userUID);
    favourites();
});


function displayUserData(userUID){
    var userRef  = database.ref(`/users/${userUID}/userData`);
    userRef.once("value", data => {
        userData = data.val();
        if(userData == null) window.location.href = pageBaseURL+prefix+"/404"+suffix;

        var displayName_formated = [];
        var displayName = userData.displayName.split(" ");
        displayName.forEach(e => displayName_formated.push(e.slice(0,1).toUpperCase() + e.slice(1,)));
        userDisplayname = displayName_formated.join(" ").trim();

        accountPic.src = "https://prefute.com/images/userProfilePicDefault.png";
        accountPic.src = userData.photoURL;
        accountName.textContent =  userDisplayname;
        accountUsername.textContent = userData.username;
        publicPredictionsCount.textContent = userData.public;
        privatePredictionsCount.textContent = userData.private;

        if(userData.public +  userData.private === 0) noPredictionsPara.classList.remove("hide");
        else noPredictionsPara.classList.add("hide");

    }).then(retriveData)
}

function retriveData(){
    var dataRef  = database.ref(`/data/`);
    dataRef.once("value", data => {
        dbData = data.val();
        for (const [id, value] of Object.entries(dbData)){
            if(value == userUID) displayPrefutes(id)
        }
        document.getElementById("load").remove();
        document.querySelector("template").remove();
    })
}

async function displayPrefutes(prefuteID){
    var prefuteContent = {prefuteId: prefuteID}

    var privateDataRef  = database.ref(`/users/${userUID}/${prefuteID}/private`);
    await privateDataRef.once("value",(data) => {
        var privateData = data.val();
        if(privateData) prefuteContent = Object.assign({}, prefuteContent, privateData);
    })
    var publicDataRef  = database.ref(`/users/${userUID}/${prefuteID}/public`);
    await publicDataRef.once("value",(data) => {
        var publicData = data.val();
        if(publicData) prefuteContent = Object.assign({}, prefuteContent, publicData);
    })
    
    const card = userCardTemplate.content.cloneNode(true).children[0];
    const predictionIdCard = card.querySelector("[data-prediction-id]");
    const uploadDateCard = card.querySelector("[data-upload-date]");
    const releaseDateCard = card.querySelector("[data-release-date]");
    const predictionLock = card.querySelector("[data-lock]");
    const releasedIcon = card.querySelector("[data-released]");

    const Local_ReleaseDate = new Date(new Date(prefuteContent.releaseTimestamp));
    const Local_ReleaseTime = Local_ReleaseDate.toTimeString().split(":");

    const Local_UploadDate = new Date(new Date(prefuteContent.uploadDate));
    const Local_UplaodTime = Local_UploadDate.toTimeString().split(":");

    predictionIdCard.textContent = `Prediction ID: ${prefuteID}`;
    releaseDateCard.textContent = `Release Date: ${Local_ReleaseDate.toDateString()}, at ${Local_ReleaseTime[0]}:${Local_ReleaseTime[1]}`;
    uploadDateCard.textContent = `Uploaded Date: ${Local_UploadDate.toDateString()}, at ${Local_UplaodTime[0]}:${Local_UplaodTime[1]}`;
                
    
    if(!prefuteContent.isPublic){
        predictionLock.classList.add("fa-lock");
        predictionLock.title = "Prefute is Private";
    }else{
        predictionLock.classList.add("fa-unlock");
        predictionLock.title = "Prefute is Public";
    }
    if(Local_ReleaseDate < new Date()){
        releasedIcon.src = pageBaseURL+"/images/released-symbol.png";
        releasedIcon.title = "Prefute has been released";
    }else{
        releasedIcon.src = pageBaseURL+"/images/notReleased-symbol.png";
        releasedIcon.title = "Prefute has not been released";
    }

    card.href = `${prefix}/prediction${suffix}?id=${prefuteID}&user=${userUID}`;
    predictionCardContainer.append(card);
}

// Add/Remove from favourites
function favourites(){

    var favouritesRef  = database.ref(`/users/${auth.currentUser.uid}/userData/favourites`);
    favouritesRef.once("value",(data) => {
        favouritesData = data.val();
        if(favouritesData != null && favouritesData.hasOwnProperty(userUID)){
            removeFromFavorites.removeAttribute("disabled");
            removeFromFavorites.classList.toggle("hide", false);
            addToFavorites.classList.toggle("hide", true);
        }else addToFavorites.removeAttribute("disabled");
    })

    addToFavorites.addEventListener('click', () => {
        database.ref(`/users/${auth.currentUser.uid}/userData/favourites`).update({ [userUID]: userDisplayname });
        removeFromFavorites.classList.toggle("hide", false);
        addToFavorites.classList.toggle("hide", true);
        removeFromFavorites.removeAttribute("disabled");
    })

    removeFromFavorites.addEventListener('click', () => {
        database.ref(`/users/${auth.currentUser.uid}/userData/favourites/${userUID}`).remove();
        removeFromFavorites.classList.toggle("hide", true);
        addToFavorites.classList.toggle("hide", false);
        addToFavorites.removeAttribute("disabled");
    })
}