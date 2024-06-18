
let JSON_DATA;
let seriesSelected;
let yearSelected;
let raceSelected;
let CARS_DATA;
let cartList = [];
let myCar = null;
init();

document.getElementById("teamNameSearch").addEventListener("input", event => search());
document.getElementById("raceNumberSearch").addEventListener("input", event => search());
document.getElementById("carModelTypeSearch").addEventListener("input", event => search());
document.getElementById("sort-select").addEventListener("change", event => search());
document.getElementById("series-select").addEventListener("change", event => onSeriesChange());
document.getElementById("year-select").addEventListener("change", event => onYearChange());
document.getElementById("race-select").addEventListener("change", event => onRaceChange());
document.getElementById("generateButton").addEventListener("click", event => generateJson());
document.getElementById("generateAIButton").addEventListener("click", event => displayGenerateAIModal());
document.getElementById("clearIA").addEventListener("click", event => clearIA());

document.getElementById("isSortDESC").addEventListener("click", event => updateSortWayButton());
document.getElementById("addAIM").addEventListener("click", event => selectAddAIM());
document.getElementById("replaceAIM").addEventListener("click", event => selectReplaceAIM());
document.getElementById("addGeneratedAIButton").addEventListener("click", event => generateAI());
document.getElementById('numberIA').addEventListener("input", event => numberIAOnChange());
document.getElementById("closeGenerateWindow").addEventListener("click", event => document.getElementById("randomAIModal").style.display = "none");




async function init() {
    JSON_DATA = await loadData("data");
    displaySeries();
}

function addCar(car) {
    //Car
    document.getElementById(car.info.carGuid).getElementsByClassName("selectionHover")[0].setAttribute("class", "selectionHover hide");

    //List
    if(cartList.length === 0) document.getElementById("noCarSelected").remove();
    cartList.push(car);
    updateCartListCarNumber();

    let html = document.createElement('div');
    html.setAttribute("id", car.info.carGuid + "CL");
    html.innerHTML = `
                <div class="carImgPortrait"><img src="./img/${raceSelected}/${car.info.raceNumber}.jpg" alt="${car.info.raceNumber}.jpg" class="carImg"/></div>
                <div class="inlineButton">
                    <label class="myCar">Your car<input type="radio" name="radioMyCar"></label>
                </div>`.trim();
    document.getElementById("cartList").insertAdjacentElement("beforeend", html);

    let deleteButton = document.createElement('button');
    deleteButton.setAttribute("class", "deleteButton");
    deleteButton.insertAdjacentHTML("beforeend", `<img src="img/trash.png" alt="trash.png"/>`);
    deleteButton.addEventListener("click", event => deleteCar(car));
    html.getElementsByClassName("inlineButton")[0].insertAdjacentElement("beforeend", deleteButton);
    html.getElementsByTagName("input")[0].addEventListener('change', event => setCartListMyCar(car));

    updateGenerateJson();
    updateEndLimit();
}

function updateCartListCarNumber() {
    document.getElementById("selectedCars").innerText = cartList.length.toString();
    document.getElementById("selectedCarsIA").innerText = (myCar == null ? cartList.length : cartList.length-1).toString();
}

function addOwnCar(car) {
    setCartListMyCar(car);
    addCar(car);
    document.getElementById(car.info.carGuid + "CL").getElementsByTagName("input")[0].click();
}

function setCartListMyCar(car) {
    myCar = car;
    document.getElementById("selectedCarImg").innerHTML = `<img src="./img/${raceSelected}/${car.info.raceNumber}.jpg" alt="${car.info.raceNumber}.jpg" class="carImg"/>`;
    updateCartListCarNumber();
    updateGenerateJson();
}

function deleteCar(car) {
    //Car
    document.getElementById(car.info.carGuid).getElementsByClassName("selectionHover")[0].setAttribute("class", "selectionHover");
    cartList = cartList.filter((carL) => car.info.carGuid !== carL.info.carGuid);
    if(myCar !== null && car.info.carGuid === myCar.info.carGuid) {
        myCar = null;
        document.getElementById("selectedCarImg").innerText = `No car selected yet`;
    }

    //List
    updateCartListCarNumber();
    document.getElementById(car.info.carGuid + "CL").remove();

    if(cartList.length === 0) {
        document.getElementById("cartList").insertAdjacentHTML("beforeend", `<div id="noCarSelected" class="noBorder carImgPortrait">No car selected yet</div>`);
    }

    updateGenerateJson();
    updateEndLimit();
}

function updateGenerateJson() {
    document.getElementById("generateButton").disabled = !(cartList.length >= 10 && myCar !== null);
    document.getElementById("generateAIButton").disabled = !(cartList.length < 50);
}

function updateEndLimit() {
    let toDisable = cartList.length >= 50;
    let allAddButton = document.getElementsByClassName('addCarButton');
    if(allAddButton[0].disabled !== toDisable) {
        Array.from(allAddButton).forEach((addButton) => addButton.disabled = toDisable);
    }
}

function search() {
    let searchResult = sort();
    let teamNameSearch = document.getElementById("teamNameSearch").value;
    let raceNumberSearch = document.getElementById("raceNumberSearch").value;
    let carModelTypeSearch = document.getElementById("carModelTypeSearch").value;

    searchResult = searchResult.filter(v => JSON_DATA.carModelType[v.info.carModelType.toString()].toLowerCase().includes(carModelTypeSearch.toLowerCase()));
    searchResult = searchResult.filter(v => v.info.teamName.toString().toLowerCase().includes(teamNameSearch.toLowerCase()));
    searchResult = searchResult.filter(v => v.info.raceNumber.toString().toLowerCase().includes(raceNumberSearch.toLowerCase()));
    displayCars(searchResult);
}

function sort() {
    let sortMethode = document.getElementById("sort-select").value;
    let sortResult = JSON.parse(JSON.stringify(CARS_DATA)).cars;
    switch (sortMethode) {
        case "carModelType":
            break;
        case "teamName":
            sortResult = sortResult.sort((a,b) => (a.info.teamName > b.info.teamName) ? 1 : ((b.info.teamName > a.info.teamName) ? -1 : 0));
            break;
        case "raceNumber":
            sortResult = sortResult.sort((a,b) => a.info.raceNumber - b.info.raceNumber);
            break;
    }
    if (document.getElementById("isSortDESC").value === 'true') {
        sortResult = sortResult.reverse();
    }
    return sortResult;
}

function displaySeries() {
    document.getElementById("generateAIButton").disabled = true;
    let yearSelect = document.getElementById("series-select");
    for (const key of Object.keys(JSON_DATA.series)) {
        yearSelect.insertAdjacentHTML("beforeend", `<option value="${key}">${key}</option>`);
    }
}

function displayYears() {
    document.getElementById("generateAIButton").disabled = true;
    let yearSelect = document.getElementById("year-select");
    yearSelect.innerHTML = '<option value="">--Year--</option>';
    document.getElementById("race-select").innerHTML = '<option value="">--Race--</option>';
    let keys = Object.keys(JSON_DATA.series[seriesSelected]);
    for (const key of keys) {
        yearSelect.insertAdjacentHTML("beforeend", `<option value="${key}">${key}</option>`);
    }
    if(keys.length === 1) {
        yearSelect.lastChild.selected = true;
        onYearChange();
    }
}

function displayRace() {
    document.getElementById("generateAIButton").disabled = true;
    let raceSelect = document.getElementById("race-select");
    raceSelect.innerHTML = '<option value="">--Race--</option>';
    let races = JSON_DATA.series[seriesSelected][yearSelected];
    for (const race of races) {
        raceSelect.insertAdjacentHTML("beforeend", `<option value="${race.filename}">${race.name}</option>`);
    }
    if(races.length === 1) {
        raceSelect.lastChild.selected = true;
        onRaceChange();
    }
}

function displayCars(data) {
    document.getElementById("generateAIButton").disabled = false;
    let table = document.getElementById("cars");
    table.innerHTML = '';
    data.forEach((car) => {
        let html = document.createElement('div');
        html.id = car.info.carGuid;
        html.innerHTML =
            `<div>
                <div class="carInfo">
                    <div class="carInfoLeft">
                        <div class="raceNumber"><span>${car.info.raceNumber}</span></div>
                        <div class="cupCategory"><span>${JSON_DATA.cupCategory[car.info.cupCategory]}</span></div>
                    </div>
                    <div class="carInfoRight">
                        <div class="teamName">${car.info.teamName.toUpperCase()}</div>
                        <div class="carModel">
                            <img src="img/flags/${car.info.nationality}.png" alt="${car.info.nationality}.png" class="flag"/>
                            <span class="carModelType">${JSON_DATA.carModelType[car.info.carModelType].toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div class="hr"></div>
                <div class="mainCarImage">
                    <img src="./img/${raceSelected}/${car.info.raceNumber}.jpg" alt="${car.info.raceNumber}.jpg" class="carImg"/>
                </div>
                <div class="hr"></div>
                <div class="chooseButton"></div>
            </div>
            <div class="selectionHover"></div>`.trim();
        table.insertAdjacentElement("beforeend", html);

        let deleteButtonHover = document.createElement('button');
        deleteButtonHover.setAttribute("class", "deleteButtonHover");
        deleteButtonHover.insertAdjacentHTML("beforeend", `<img src="img/trash.png" alt="trash.png"/>`);
        deleteButtonHover.addEventListener("click", event => deleteCar(car));
        html.getElementsByClassName("selectionHover")[0].insertAdjacentElement("beforeend", deleteButtonHover);

        let chooseButton = html.getElementsByClassName("chooseButton")[0];

        let cbmc = document.createElement('button');
        cbmc.innerText = "My Car";
        cbmc.setAttribute("class", "addCarButton");
        cbmc.addEventListener("click", event => addOwnCar(car));
        cbmc.disabled = false;
        chooseButton.insertAdjacentElement("beforeend", cbmc);

        chooseButton.insertAdjacentHTML("beforeend", `<div class="vr"></div>`);

        let cbic = document.createElement('button');
        cbic.innerText = "Add IA Car";
        cbic.setAttribute("class", "addCarButton");
        cbic.addEventListener("click", event => addCar(car));
        cbic.disabled = false;
        chooseButton.insertAdjacentElement("beforeend", cbic);
    });
}

function onSeriesChange() {
    document.getElementById("cars").innerHTML = '';
    clearIA();
    seriesSelected = document.getElementById("series-select").value;
    displayYears();
}

function onYearChange() {
    document.getElementById("cars").innerHTML = '';
    clearIA();
    yearSelected = document.getElementById("year-select").value;
    displayRace();
}

async function onRaceChange() {
    document.getElementById("cars").innerHTML = '';
    clearIA();
    raceSelected = document.getElementById("race-select").value;
    CARS_DATA = await loadData(raceSelected);
    search();
}

async function loadData(fileName) {
    let response  = await fetch('./data/'+fileName+'.json');
    return await response.json();
}

function generateJson() {
    let exportCarList = [...cartList];
    exportCarList = exportCarList.filter((carL) => myCar.info.carGuid !== carL.info.carGuid);
    let exportMyCar = JSON.parse(JSON.stringify(myCar));
    exportMyCar.drivers.forEach(i => i.info.playerID = "1");
    let json = {cars:[exportMyCar, ...exportCarList]};
    downloadObjectAsJson(json, "championship_entrylist");
}

function downloadObjectAsJson(exportObj, exportName){
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function displayGenerateAIModal() {
    document.getElementById('numberIA').value = "";
    document.getElementById("addAIM").click();
    document.getElementById("randomAIModal").style.display = "flex";
}

let isAddGeneratedAI = true;

function selectAddAIM() {
    isAddGeneratedAI = true;
    document.getElementById('numberIA').max = 50-cartList.length;
    document.getElementById('maxGenLimit').innerText = (50-cartList.length).toString();
    numberIAOnChange();
}

function selectReplaceAIM() {
    isAddGeneratedAI = false;
    document.getElementById('numberIA').max = myCar === null ? 50 : 49;
    document.getElementById('maxGenLimit').innerText = (myCar === null ? 50 : 49).toString();
    numberIAOnChange();
}

function generateAI() {
    let numberIA = parseInt(document.getElementById('numberIA').value);
    let shuffledList = [...CARS_DATA.cars].sort(() => Math.random() - 0.5);
    shuffledList = shuffledList.slice(0, (!isNaN(numberIA)) ? numberIA : parseInt(document.getElementById('numberIA').max));
    if(isAddGeneratedAI) {
        shuffledList.filter(car => {
            return cartList.findIndex(carTF => car.info.carGuid === carTF.info.carGuid) < 0;
        })
    } else {
        cartList.forEach(car => deleteCar(car));
    }
    shuffledList.forEach(car => addCar(car));
    document.getElementById("randomAIModal").style.display = "none";
}

function updateSortWayButton() {
    let sortWayButton = document.getElementById("isSortDESC");
    sortWayButton.innerHTML = (sortWayButton.value === 'true') ? `<img alt="asc.jpg" src="img/asc.jpg">` : `<img alt="desc.jpg" src="img/desc.jpg">`;
    sortWayButton.value = !(sortWayButton.value === 'true');
    search();
}

function numberIAOnChange() {
    let numberIA = parseInt(document.getElementById("numberIA").value);
    let maxLimit = parseInt(document.getElementById("maxGenLimit").innerText);
    document.getElementById('addGeneratedAIButton').disabled = !(numberIA >= 1 && numberIA <= maxLimit);
}

function clearIA() {
    cartList.forEach(car => deleteCar(car));
}










