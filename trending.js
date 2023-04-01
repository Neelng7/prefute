const userCardTemplate= document.querySelector("[data-template]");
const predictionCardContainer= document.querySelector("[data-prediction-cards-container]");
const searchLoad = document.getElementById("search-load");
const userName = document.getElementById("user-name");
const noResults =  document.querySelector(".no-prefute-found")
// const noPredictionFound = document.querySelector(".no-prediction-found");
var dbData, dbPrediction, dbUser, count = 0;
var filterOnlyArray = ["released", "unreleased", "public", "private"];
getData();

var today = new Date();
today.setDate(today.getDate()-1);

//Welcome user name
auth.onAuthStateChanged(user => {
    if (user) {
        userName.textContent = auth.currentUser.displayName;
    }
});

function getData(){
    searchLoad.classList.toggle("hide", false);
    // noPredictionFound.classList.toggle("hide", true);
    predictionCardContainer.innerHTML = "";
    var dbDataRef  = database.ref('/data/');
    dbDataRef.once("value",(data) => {
        dbData = data.val();
        // for (const [idx, value] of Object.entries(dbData)){
        Object.entries(dbData).forEach(data => {
            var value = data[1], idx = data[0];
            if(idx === "userData") return;
            else if(value == null || value == undefined || value == "") return;
            else{
                if(auth.currentUser && auth.currentUser.uid == value) return;
                var dbUserRef  = database.ref(`/users/${value}/userData/`);
                dbUserRef.once("value", data => {
                    dbUser = data.val();
                    if(dbUser !== null) displayPredictions(idx, value, dbUser);
                })
            }
        })
    });
}

async function displayPredictions(id, uid, dbUser){

    var predictionCardData = {prefuteId: id, name: dbUser.displayName, username: dbUser.username}

    var privateDataRef  = database.ref(`/users/${uid}/${id}/private`);
    await privateDataRef.once("value",(data) => {
        var privateData = data.val();
        if(privateData) predictionCardData = Object.assign({}, predictionCardData, privateData);
    })
    var publicDataRef  = database.ref(`/users/${uid}/${id}/public`);
    await publicDataRef.once("value",(data) => {
        var publicData = data.val();
        if(publicData) predictionCardData = Object.assign({}, predictionCardData, publicData);
    });

    searchLoad.classList.toggle("hide", true);
    // if(predictionCardContainer.children.length == 0) noPredictionFound.classList.toggle("hide", false);
    noResults.classList.toggle("hide", false);  

    const card = userCardTemplate.content.cloneNode(true).children[0];
    const predictionIdCard = card.querySelector("[data-prediction-id]");
    const UserNameCard = card.querySelector("[data-user-name]");
    const UserUsernameCard = card.querySelector("[data-user-email]");
    const releaseDateCard = card.querySelector("[data-release-date]");
    const predictionLock = card.querySelector("[data-lock]");
    const releasedIcon = card.querySelector("[data-released]");
    const publicTags = card.querySelector("[data-tags]");

    const Local_ReleaseDate = new Date(predictionCardData.releaseTimestamp);
    const Local_ReleaseTime = Local_ReleaseDate.toTimeString().split(":");
    releaseDateCard.textContent = `Release Date: ${Local_ReleaseDate.toDateString()}, at ${Local_ReleaseTime[0]}:${Local_ReleaseTime[1]}`;

    UserNameCard.textContent = "Name: " + predictionCardData.name;
    UserUsernameCard.textContent = "Username: " + predictionCardData.username;
    predictionIdCard.textContent = predictionCardData.prefuteId;

    const Local_UploadDate = new Date(predictionCardData.uploadDate);
    // var thisMonth = new Date()
    // thisMonth.setMonth(thisMonth.getMonth() - 1);
    // if(Local_UploadDate < thisMonth) return;
    // if(noResults) noResults.remove();

    var thisYear = new Date("2000-01-01")
    thisYear.setFullYear(new Date().getFullYear())
    if(Local_UploadDate < thisYear) return;
    if(noResults) noResults.remove();


    if(!predictionCardData.isPublic){
        predictionLock.classList.add("fa-lock");
        predictionLock.title = "Prefute is Private";
        if(!filterOnlyArray.includes("private")) return;
    }else{
        predictionLock.classList.add("fa-unlock");
        predictionLock.title = "Prefute is Public";
        publicTags.textContent = predictionCardData.tags;
        if(!filterOnlyArray.includes("public")) return;
    }
    if(Local_ReleaseDate < new Date()){
        releasedIcon.src = pageBaseURL+"/images/released-symbol.png";
        releasedIcon.title = "Prefute has been released";
        if(!filterOnlyArray.includes("released")) return;
    }else{
        releasedIcon.src = pageBaseURL+"/images/notReleased-symbol.png";
        releasedIcon.title = "Prefute has not been released";
        if(!filterOnlyArray.includes("unreleased")) return;
    }

    card.href = `${prefix}/prediction${suffix}?id=${id}&user=${uid}`;
    predictionCardContainer.append(card);
    count += 1;
}

//Search Only Filters
const searchOnlyFilters = document.querySelectorAll(".search-only-filter");
const searchOnlyReleased = document.getElementById("search-only-filters-released");
const searchOnlyUnreleased = document.getElementById("search-only-filters-unreleased");
const searchOnlyPublic = document.getElementById("search-only-filters-public");
const searchOnlyPrivate = document.getElementById("search-only-filters-private");

searchOnlyFilters.forEach(elm => {
    elm.checked = true;
    elm.addEventListener("change",  () => {
        filterOnlyArray[0] = searchOnlyReleased.checked ? "released" : null;
        filterOnlyArray[1] = searchOnlyUnreleased.checked ? "unreleased" : null;
        filterOnlyArray[2] = searchOnlyPublic.checked ? "public" : null;
        filterOnlyArray[3] = searchOnlyPrivate.checked ? "private" : null;
        getData();
    })
})

//Search Filters
const searchByFilters = document.querySelectorAll("search-filter-checkbox");
const searchResults = document.getElementById("searchResults");
const searchResultsPElm = document.getElementById("searchResults-content");
var currentFilter = "id";

searchByFilters.forEach(inp => {
    inp.addEventListener('click', () => {
        currentFilter = inp.id.split("-")[1];
    })
})


