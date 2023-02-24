const userCardTemplate= document.querySelector("[data-template]");
const predictionCardContainer= document.querySelector("[data-prediction-cards-container]");
const searchLoad = document.getElementById("search-load");
const noPredictionFound = document.querySelector(".no-prediction-found");
var dbData, dbPrediction, dbUser;
var filterOnlyArray = ["released", "unreleased", "public", "private"];
getData();

function getData(){
    searchLoad.classList.toggle("hide", false);
    noPredictionFound.classList.toggle("hide", true);
    predictionCardContainer.innerHTML = "";
    var dbDataRef  = database.ref('/data/');
    dbDataRef.once("value",(data) => {
        dbData = data.val();
        // for (const [idx, value] of Object.entries(dbData)){
        Object.entries(dbData).forEach(data => {
            var value = data[1], idx = data[0];
            if(idx === "user-data") return;
            else if(idx.includes("@")) return;
            else{
                if(auth.currentUser && auth.currentUser.uid == value) return;
                var dbUserRef  = database.ref(`/users/${value}/userData/`);
                dbUserRef.once("value", data => {
                    dbUser = data.val();
                    displayPredictions(idx, value, dbUser);
                })
            }
        })
    });
}

function displayPredictions(id, uid, dbUser){
    var dbPredictionRef  = database.ref(`/users/${uid}/${id}/`);
    dbPredictionRef.once("value",(data) => {
        dbPrediction = data.val();
        if(!dbPrediction) return;

        const card = userCardTemplate.content.cloneNode(true).children[0];
        const predictionIdCard = card.querySelector("[data-prediction-id]");
        const UserNameCard = card.querySelector("[data-user-name]");
        const UserEmailCard = card.querySelector("[data-user-email]");
        const releaseDateCard = card.querySelector("[data-release-date]");
        const predictionLock = card.querySelector("[data-lock]");
        const releasedIcon = card.querySelector("[data-released]");
        const publicTags = card.querySelector("[data-tags]");

        const Local_ReleaseDate = new Date(dbPrediction.public.releaseTimestamp);
        const Local_ReleaseTime = Local_ReleaseDate.toTimeString().split(":");

        predictionIdCard.textContent = id;
        releaseDateCard.textContent = `Release Date: ${Local_ReleaseDate.toDateString()}, at ${Local_ReleaseTime[0]}:${Local_ReleaseTime[1]}`;

        UserNameCard.textContent = "Name: " + dbUser.displayName;
        UserEmailCard.textContent = "Username: " + dbUser.email.split("@")[0];

        if(dbPrediction.password.password != ""){
            predictionLock.classList.add("fa-lock");
            predictionLock.title = "Prefute is Private";
            if(!filterOnlyArray.includes("private")) return;
        }else{
            predictionLock.classList.add("fa-unlock");
            predictionLock.title = "Prefute is Public";
            publicTags.textContent = dbPrediction.public.tags;
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
    }).then(() => {
        searchLoad.classList.toggle("hide", true);
        if(predictionCardContainer.children.length == 0) noPredictionFound.classList.toggle("hide", false);
        else noPredictionFound.classList.toggle("hide", true);
    });
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

const searchInp = document.getElementById("search");
searchInp.addEventListener("input", () => {

    const searchValue = searchInp.value.toLowerCase();
    var resultsCount = 0; 

    const cardEls = document.querySelectorAll(".card");
    cardEls.forEach((e) => {

    const predictionid = e.querySelector(".header").textContent;
    const name = e.querySelector(".name").textContent;
    const email = e.querySelector(".email").textContent;
    const tags = e.querySelector(".search-tags").textContent;
    
    const searchValueSplit = searchValue.split(" ");
    
    for(let n=0; n<searchValueSplit.length; n++){
        if(predictionid.includes(searchValueSplit[n]) || name.includes(searchValueSplit[n])){
            e.classList.remove("hide")
        }else if(email.includes(searchValueSplit[n]) || tags.includes(searchValueSplit[n])){
            e.classList.remove("hide")
        }else{
            e.classList.add("hide")
            // break;
        } 
    }
    if(!e.classList.contains("hide")) resultsCount += 1;
    })
    generateSearchReults(resultsCount);
})

function generateSearchReults(resultsCount){
    searchResults.textContent = resultsCount;   
    searchResultsPElm.classList.remove("hide");
    noPredictionFound.classList.add("hide");

    if(resultsCount == 0){
        searchResultsPElm.classList.add("hide");
        noPredictionFound.classList.toggle("hide", false);
    }
}

const filterDropdown = document.getElementById("filter-dropdown");
const searchOnlyFiltersWrapper = document.querySelector(".search-only-filters-wrapper");

filterDropdown.addEventListener('click', () => {
    filterDropdown.classList.toggle("fa-angle-down");
    filterDropdown.classList.toggle("fa-angle-up");
    searchOnlyFiltersWrapper.classList.toggle("hide");
})
