var stats;
var settings;
var game;
var timer;
var selected;

function toggleTheme() {
    settings.setDarkMode(document.getElementById('themeSetting').checked);
    settings.saveSettings();
    settings.getDarkMode() ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'light');
    if(settings.getDarkMode()) {
        //Put the light icons on
        document.getElementById('htpImage').src = 'assets/light-bulb_light.png';
        document.getElementById('statsImage').src = 'assets/medals_light.png';
        document.getElementById('settingsImage').src = 'assets/settings_light.png';
        document.getElementById('undoImage').src = 'assets/undo_light.png';
        document.getElementById('redoImage').src = 'assets/redo_light.png';
    }
    else {
        document.getElementById('htpImage').src = 'assets/light-bulb.png';
        document.getElementById('statsImage').src = 'assets/medals.png';
        document.getElementById('settingsImage').src = 'assets/settings.png';
        document.getElementById('undoImage').src = 'assets/undo.png';
        document.getElementById('redoImage').src = 'assets/redo.png';
    }   
}

function toggleGroupTotals() {
    settings.setShowTotals(document.getElementById('groupTotalsSetting').checked);
    settings.saveSettings();
    displayGame();
}


var maxWidth = 0;
function displayGame() {
    //Set the target
    document.getElementById("targetNumber").innerHTML = game.target;

    //Set the number pool
    let pool = document.getElementById("poolDiv");
    //We only want to add these events once, so once the init is set to true, just skip
    if(!pool.getAttribute("init")) {
        pool.setAttribute('data-groupID',-1);
        pool.addEventListener("dragenter", function(e) {dragEnter(e, this); });
        pool.addEventListener("dragover", function(e) {dragOver(e, this); });
        pool.addEventListener("dragleave", function(e) {dragLeave(e, this); });
        pool.addEventListener("drop", function(e) {drop(e, this); });
        pool.addEventListener("click", function(e) {moveFromClick(e, this); });
        pool.setAttribute("init", true);
    }
    
    pool.innerHTML = '';

    

    for (var i = 0; i < game.workingNumberPool.length; i++) {

        if(game.workingNumberPool[i].toString().length > maxWidth) {
            maxWidth = game.workingNumberPool[i].toString().length;
        }
        pool.appendChild(createNumberElement(game.workingNumberPool[i], game.workingNumberPool[i]));
    }

    var emptyNums = (game.elementCount * game.groupsCount) - game.workingNumberPool.length;
    for (var j = 0; j < emptyNums; j++) {
        pool.appendChild(createNumberElement("__",""));
    }

    //Append a style sheet setting the width of each number element
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule(`
        .dynamic {
            width: ${maxWidth}em;
            text-align: center;
        }
    `);

    //Set the answer areas
    let groups = document.getElementById("groupsDiv");
    groups.innerHTML = "";
    for(var k = 0; k < game.groupsCount; k++) {
        var groupDiv = document.createElement("div");
        groupDiv.setAttribute('data-groupID',k);
        groupDiv.classList.add("numberPool");
        //Only allow the drop if there aren't enough numbers already
        if(game.workingGroupsList[k].length < game.elementCount) {
            groupDiv.addEventListener("dragenter", function(e) {dragEnter(e, this); });
            groupDiv.addEventListener("dragover", function(e) {dragOver(e, this); });
            groupDiv.addEventListener("dragleave", function(e) {dragLeave(e, this); });
            groupDiv.addEventListener("drop", function(e) {drop(e, this); });
            groupDiv.addEventListener("click", function(e) {moveFromClick(e, this); });
        }        

        var groupTotal = 0;
        for (var m = 0; m < game.workingGroupsList[k].length; m++) {
            groupDiv.appendChild(createNumberElement(game.workingGroupsList[k][m], game.workingGroupsList[k][m]));
            groupTotal += game.workingGroupsList[k][m];
        }

        var emptyNums = game.elementCount - game.workingGroupsList[k].length;
        for (var l = 0; l < emptyNums; l++) {
            groupDiv.appendChild(createNumberElement("__",""));
        }

        //Add the total
        if(settings.getShowTotals()) {
            var totalDiv = document.createElement("div");
            node = document.createTextNode(groupTotal);
            totalDiv.classList.add("groupTotal" + k);
            totalDiv.classList.add("dynamicGroupTotal");
            totalDiv.appendChild(node);
            groupDiv.appendChild(totalDiv);

            const style = document.createElement('style');
            document.head.appendChild(style);
            style.sheet.insertRule(`
                .dynamicGroupTotal {
                    width: ${maxWidth}em;
                }
            `);
        }
        

        groups.appendChild(groupDiv);
    }

    //Enable/Disable the undo/redo buttons
    document.getElementById("undoBtn").enabled = undoStack.length > 0;
    document.getElementById("redoBtn").enabled = redoStack.length > 0;

}

function createNumberElement(value, dataValue) {
    var numDiv = document.createElement("div");
    var node = document.createTextNode(value);
    numDiv.appendChild(node);
    numDiv.setAttribute("data-value", dataValue);
    numDiv.classList.add("number");
    numDiv.classList.add("emptyNumber");
    numDiv.classList.add("dynamic");
    numDiv.addEventListener('dragstart', dragStart);
    if(dataValue !== "") {
        numDiv.addEventListener("click", selectNumber);
        numDiv.setAttribute("draggable", true);
    }

    return numDiv;
}

function startNewGame() {
    let diff = parseInt(document.querySelector('input[name="difficulty"]:checked').value) ?? 0;
    settings.setDifficulty(diff);
    settings.saveSettings();
    clockReset(timer);
    var output = document.getElementById("timerSpan");
    output.innerHTML = "0:00";

    undoStack = [];
    redoStack = [];
    game = new BalancingAct(diff);
    game.newPuzzle(diff);
    stats.addPlay(diff);
    displayGame();
    gameModal.style.display = "none";

    if(game !== undefined && game.solved === false) {
        clockStart(timer);
    }
    
}

function resetStats() {
    if(window.confirm("Are you sure you want to reset your stats?")) {
        stats.resetStats();
        populateStatsTable(stats);
    }   
}

function init() {
    //Initialize their stats
    stats = new Stats();
    stats.loadStats();

    initModals(stats);

    settings = new Settings();
    settings.loadSettings();

    //TODO: Set Difficulty from settings
    let radios = document.getElementsByName("difficulty");
    for (var i = 0; i < radios.length; i++) {
        if(parseInt(radios[i].value) === settings.getDifficulty()) {
            radios[i].checked = true;
        }
    }

    timer = new Timer(0, 0, false, updateClock);

    toggleTheme();

    if(localStorage.getItem('currentPuzzle') != undefined && localStorage.getItem('currentPuzzle') != null && localStorage.getItem('isSolved') === 'false') {
        game = new BalancingAct();
        game.loadPuzzle();
        displayGame();

        let savedTime = localStorage.getItem('savedTime');
        if(savedTime != undefined && savedTime != null) {
            timer.setMilliseconds(parseInt(savedTime));
        }
        clockStart(timer);
    }
    else {
        var gameModal = document.getElementById("newGameModal");
        gameModal.style.display = "block";
    }
}



function moveNumber(value, oldGroup, newGroup) {
    let command = new Command(oldGroup, newGroup, value);
    command.execute(game);
    undoStack.push(command);
    redoStack = [];
    displayGame();
    //Check if they won the game
    if(game.checkResult()) {
        processWin();
    }

    game.savePuzzle();
    saveTime();

}

function saveTime() {
    let time = timer.getMilliseconds();
    localStorage.setItem('savedTime', time);
}

function moveFromClick(e, element) {
    if(selected) {
        if (selected.target.classList.contains("numSelected")) {
            selected.target.classList.remove("numSelected");
        }
        let newGroup = element.getAttribute('data-groupid');
        moveNumber(parseInt(selected.value), parseInt(selected.group), parseInt(newGroup));
    }
    selected = null;
}

function processWin() {
    game.solved = true;
    clockStop(timer);
    winModal = document.getElementById("winModal");
    winModal.style.display = "block";
    document.getElementById('winTimeSpan').innerHTML = timer.getTime();
    stats.addWin(game.difficulty, timer.getSeconds());
}

function selectNumber(e) {
    if(selected && selected.target.classList.contains("numSelected")) {
        selected.target.classList.remove("numSelected");
    }

    let val = e.target.getAttribute('data-value');
    let group = e.target.parentNode.getAttribute('data-groupid');
    selected = {value: val, group: group, target: e.target}
    e.target.classList.add("numSelected");
    event.stopPropagation();
}

function dragStart(e) {
    let val = e.target.getAttribute('data-value');
    let group = e.target.parentNode.getAttribute('data-groupid');
    e.dataTransfer.setData('text/plain',JSON.stringify({value: val, group: group}));
}

function dragEnter(e, element) {
    e.preventDefault();
    element.classList.add("drag-over");
}

function dragOver(e, element) {
    e.preventDefault();
    element.classList.add("drag-over");
}

function dragLeave(e, element) {
    if (element.classList.contains("drag-over")) {
        element.classList.remove("drag-over");
    }
}

function drop(e, element) {
    e.preventDefault();
    if (element.classList.contains("drag-over")) {
        element.classList.remove("drag-over");
    }

    let newGroup = element.getAttribute('data-groupid');
    let data = JSON.parse(e.dataTransfer.getData('text/plain'));
    moveNumber(parseInt(data.value), parseInt(data.group), parseInt(newGroup));
}

function undo() {
    if(undoStack.length > 0) {
        let move = undoStack.pop();
        move.unexecute(game);
        redoStack.push(move);
        displayGame();

        game.savePuzzle();
        saveTime();
    } 
}

function redo() {
    if(redoStack.length > 0) {
        let move = redoStack.pop();
        move.execute(game);
        undoStack.push(move);
        displayGame();

        game.savePuzzle();
        saveTime();
    }
}

function updateClock() {
    var output = document.getElementById("timerSpan");
    output.innerHTML = timer.getTime();
}