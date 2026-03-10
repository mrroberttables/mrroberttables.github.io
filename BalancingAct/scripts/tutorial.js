function getCutout(elementNames) {
	var points = [];

	for(var i = 0; i < elementNames.length; i++) {
		let divOffsets = document.getElementById(elementNames[i]).getBoundingClientRect();

		points.push(`${divOffsets.left}px ${divOffsets.top}px`);
		points.push(`${divOffsets.right}px ${divOffsets.top}px`);
		points.push(`${divOffsets.right}px ${divOffsets.bottom}px`);
		points.push(`${divOffsets.left}px ${divOffsets.bottom}px`);
		points.push(`${divOffsets.left}px ${divOffsets.top}px`);
		points.push(`0 0`);
	}
	


	let hole = `polygon( evenodd, 
		0 0,
		100% 0,
		100% 100%,
		0 100%,
		0 0,
		${points.join(",")}
		`;

	let overlay = document.getElementById("overlay");
	overlay.style.clipPath = hole;
}

function createTutorialTextBox(text, parent) {
	var p = document.getElementById(parent).getBoundingClientRect();
	var div = document.createElement("div");
	div.innerHTML = text;
	div.classList.add("tutorialTextBox");
	div.style.top = `${p.bottom + 5}px`;
	div.style.left = `${p.left}px`;
	div.style.width = `${p.width}px`;

	return div;
}

function createTutorialButton(text, parentOffset, event) {
	var next = document.createElement("button");
	next.innerHTML = text;
	next.classList.add("btn");
	next.style.position = "absolute";
	next.style.top = `${parentOffset.bottom + 5}px`;
	next.style.left = `${parentOffset.left}px`;
	next.addEventListener("click", event);

	return next;
}

function createCloseButton(button) {
	var offset = button.getBoundingClientRect();
	var close = document.createElement("button");
	close.innerHTML = "Close";
	close.classList.add("btn");
	close.style.position = "absolute";
	close.style.top = `${offset.top}px`;
	close.style.left = `${offset.right + 5}px`;
	close.addEventListener("click", closeTutorial);

	return close;
}

var currentPuzzle;
var currentTime;

function startTutorial() {
	clockStop(timer);
	currentPuzzle = game;
	currentTime = timer.getMilliseconds();
	timer.setTime(0);
	game = new BalancingAct(0);
	game.newPuzzle(0);
	game.setPuzzle(0, 17, [[1,3,13],[2,7,8]], 2, 3, [1,2,3,7,8,13]);
	displayGame();
	updateClock();

	let overlay = document.getElementById("overlay");
	overlay.style.display = "block";
	let invisible = document.getElementById("invisibleOverlay");
	invisible.style.display = "block";

	getCutout(["poolDiv","groupsDiv"]);

	//Add first message box
	overlay.appendChild(createTutorialTextBox("Divide the pool of numbers...","poolDiv"));

	//Add second messsage box
	var lastDiv = createTutorialTextBox("into equal groups.",'groupsDiv');
	overlay.appendChild(lastDiv);

	let lastDivOffsets = lastDiv.getBoundingClientRect();

	//Add next button
	var next = createTutorialButton("Next", lastDivOffsets, tutorial2);
	overlay.appendChild(next);
	var close = createCloseButton(next);
	overlay.appendChild(close);

}

function tutorial2() {
	getCutout(["targetDiv"]);
	overlay.innerHTML = "";

	//Add first message box
	let lastDiv = createTutorialTextBox("Each group must sum to the target.",'targetDiv');
	overlay.appendChild(lastDiv);

	let lastDivOffsets = lastDiv.getBoundingClientRect();

	//Add next button
	var next = createTutorialButton("Next", lastDivOffsets, tutorial3);
	overlay.appendChild(next);
	var close = createCloseButton(next);
	overlay.appendChild(close);
}

function tutorial3() {
	overlay.style.clipPath = "";
	overlay.innerHTML = "";

	//Add first message box
	let lastDiv = createTutorialTextBox("Drag and drop a number into a group. <br><br>OR <br><br>Click a number to select it. Then click a group to move the number to that group. <br><br>You can move numbers back into the pool, and from group to group.",'poolDiv');
	overlay.appendChild(lastDiv);

	let lastDivOffsets = lastDiv.getBoundingClientRect();

	//Add next button
	var next = createTutorialButton("Next", lastDivOffsets, tutorialFinal);
	overlay.appendChild(next);
	var close = createCloseButton(next);
	overlay.appendChild(close);
}

function tutorialFinal() {
	getCutout(["gameBody"]);
	overlay.innerHTML = "";

	//Complete Puzzle
	game.workingGroupsList = [[1,3,13],[2,7,8]];
	game.workingNumberPool = [];
	displayGame();

	//Add first message box
	let lastDiv = createTutorialTextBox("A solved puzzle.",'gameBody');
	overlay.appendChild(lastDiv);

	let lastDivOffsets = lastDiv.getBoundingClientRect();

	//Add next button
	var next = createTutorialButton("Close", lastDivOffsets, closeTutorial);
	overlay.appendChild(next);
}

function closeTutorial() {
	overlay.innerHTML = "";
	game = currentPuzzle;
	timer.setMilliseconds(currentTime);
	updateClock();
	displayGame();

	overlay.style.display = "none";
	let invisible = document.getElementById("invisibleOverlay");
	invisible.style.display = "none";
	if(game !== undefined && game.solved === false) {
        clockStart(timer);
    }
    
}