let undoStack = [];
let redoStack = [];

class Command {
	value;
	previousGroup;
	newGroup;

	constructor(prev, next, value) {
		this.value = value;
		this.previousGroup = prev;
		this.newGroup = next;
	}

	execute(game) {
			if(this.previousGroup === -1) {
				game.workingNumberPool = remove(game.workingNumberPool,this.value);
			}
			else {
				game.workingGroupsList[this.previousGroup] = remove(game.workingGroupsList[this.previousGroup],this.value);
			}
			if(this.newGroup === -1) {
				game.workingNumberPool.push(this.value);
				game.workingNumberPool.sort((a,b) => {return a - b});
			}
			else {
				game.workingGroupsList[this.newGroup].push(this.value);
			}	
	}

	unexecute(game) {
		if(this.newGroup === -1) {
			game.workingNumberPool = remove(game.workingNumberPool,this.value);		
		}
		else {
			game.workingGroupsList[this.newGroup] = remove(game.workingGroupsList[this.newGroup],this.value);
		}
		
		if(this.previousGroup === -1) {
			game.workingNumberPool.push(this.value);
			game.workingNumberPool.sort((a,b) => {return a - b});
		}
		else {
			game.workingGroupsList[this.previousGroup].push(this.value);		
		}
	}
}

