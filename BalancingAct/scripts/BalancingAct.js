class BalancingAct {
	difficulty = undefined;
	groupList = []; //Numbers in their groups, expected answer
	target = 0; //Target sum
	groupsCount = 0; //Number of groups in the puzzle
	elementCount = 0; //Number of elements in a group
	negatives = false; //Are negatives allowed in the puzzle
	numbers = []; //Bank of all numbers
	solved = true;

	workingGroupsList = [];
	workingNumberPool = [];

	constructor(difficulty) {
		//this.newPuzzle(difficulty);
	}

	savePuzzle() {
		let puzzle = {difficulty: this.difficulty, target: this.target, groupList: this.groupList, groupsCount: this.groupsCount, elementCount: this.elementCount, numbers: this.numbers, workingNumberPool: this.workingNumberPool, workingGroupsList: this.workingGroupsList};
		
		let puzzleString = JSON.stringify(puzzle);

		localStorage.setItem('currentPuzzle', puzzleString);
		localStorage.setItem('isSolved', this.solved);
	}

	loadPuzzle() {
		let puzzle = JSON.parse(localStorage.getItem('currentPuzzle'));
		if(puzzle != undefined && puzzle != null) {
			this.difficulty = puzzle.difficulty;
			this.target = puzzle.target;
			this.groupList = puzzle.groupList;
			this.groupsCount = puzzle.groupsCount;
			this.elementCount = puzzle.elementCount;
			this.numbers = puzzle.numbers;
			this.workingNumberPool = puzzle.workingNumberPool;
			this.workingGroupsList = puzzle.workingGroupsList;
			this.solved = localStorage.getItem('isSolved') === 'true';
		}

	}

	newPuzzle(difficulty) {
		this.difficulty = difficulty;
		//this.groupList = [];
		this.createPuzzle();
		this.savePuzzle();
	}

	createPuzzle() {
		this.generateParams();
		this.generatePuzzle();
		if(this.negatives) {
			this.target -= this.reduction;
		}	
		this.solved = false;
	}

	generatePuzzle() {
		var powersetList = [];

		while (this.groupList.length < this.groupsCount) {
			var group1 = this.generateGroup(this.elementCount, this.target);

			if(this.checkGroup(powersetList, group1)) {
				powersetList.push(this.generatePowersetSum(group1));
				this.groupList.push(group1);
			}
		}

		var finalNums = [].concat.apply([], this.groupList);
		finalNums.sort(this.sortNumber);
		this.numbers = finalNums;
		this.workingNumberPool = finalNums;
		this.workingGroupsList = Array(this.groupsCount);
		for(var i = 0; i < this.groupsCount; i++) {
			this.workingGroupsList[i] = [];
		}
	}

	generateParams() {
		var min, max, groupsP, elementsP, negs;
		switch(this.difficulty) {
			case Difficulty.START:
				min = 15;
				max = 100;
				groupsP = [2];
				elementsP = [3];
				negs = false;
				break;
			case Difficulty.EASY:
				min = 20;
				max = 300;
				groupsP = [2,3];
				elementsP = [3,4];
				negs = false;
				break;
			case Difficulty.MEDIUM:
				min = 200;
				max = 1000;
				groupsP = [2,3,4];
				elementsP = [3,4,5,6];
				negs = (Math.random() < .3) ? true : false;
				break;
			case Difficulty.HARD:
				min = 900;
				max = 1800;
				groupsP = [3,4];
				elementsP = [5,6,7];
				negs = (Math.random() < .5) ? true : false;
				break;
			case Difficulty.EXPERT:
				min = 1500;
				max = 5000;
				groupsP = [3,4,5];
				elementsP = [5,6,7,8];
				negs = (Math.random() < .6) ? true : false;
				break
			default:
				min = 15;
				max = 100;
				groupsP = [2];
				elementsP = [3];
				negs = false;
		}

		var range = max - min;
		this.target = Math.round(Math.random() * range) + min;
		this.groupsCount = groupsP[Math.floor(Math.random() * groupsP.length)];
		this.elementCount = elementsP[Math.floor(Math.random() * elementsP.length)];
		this.negatives = negs;
		if(negs) {
			this.reduction = Math.round(this.target * ((Math.random() * 0.6) + 0.1));
		}
	}

	generateGroup(elements, target) {
		while(true) {
			var group = [0];
			var reduct, reductFinal, reductTotal;
			
			if(this.negatives) {
				reduct = [0];
				reductFinal = [];
				reductTotal = 0;
			}

			for(var i = 0; i < elements - 1; i++) {
				group.push(Math.random());
				if(this.negatives) {
					reduct.push(Math.random());
				}
				
			}

			group.push(1);
			group.sort();

			if(this.negatives) {
				reduct.push(1);
				reduct.sort();
			}
			
			
			var final = [];
			var total = 0;
			


			for(var j = 1; j < group.length; j++) {
				var value = Math.round((group[j] - group[j-1]) * target);
				final.push( value);
				total += value;

				if(this.negatives) {
					var redvalue = Math.round((reduct[j] - reduct[j-1]) * this.reduction);
					reductFinal.push(redvalue);
					reductTotal += redvalue;
				}
				
			}

			final[elements - 1] += (target - total);
			
			if(this.negatives) {
				reductFinal[elements - 1] += (this.reduction - reductTotal);
				for(var k = 0; k < final.length; k++) {
					final[k] -= reductFinal[k];
				}
			}
			
			if (final.includes(0)) {
				continue;
			}
			if(final.length === new Set(final).size) {
				return final;
			}
		}
	}

	generatePowersetSum(group) {
		var i;
		var powerset = [];
		var result, mask, total = Math.pow(2, group.length);
		for(mask = 1; mask < total - 1; mask++) {
			result = [];
			i = group.length - 1;
			do {
				if( (mask & (1 << i)) !== 0) {
					result.push(group[i]);
				}
			} while(i--);

			powerset.push([result.length, result.reduce(function(a,b) { return a + b}, 0 )]);
		}

		return powerset;
	}

	checkGroup(powerSetList, potentialGroup) {
		var powerset = this.generatePowersetSum(potentialGroup);
		var subset, group, sset;
		for(var x = 0; x < powerset.length; x++) {
			subset = powerset[x];
			for(var y = 0; y < powerSetList.length; y++) {
				group = powerSetList[y];
				for(var z = 0; z < group.length; z++) {
					sset = group[z];

					if(sset[0] === subset[0] && sset[1] === subset[1]) {
						return false;
					}
				}
			}
		}
		return true;
	}

	sortNumber(a,b) {
		return a - b;
	}

	//TODO: perform this check better and check that they actually use the numbers provided
	checkResult() {
		for(var i = 0; i < this.workingGroupsList.length; i++) {
			if(this.workingGroupsList[i].length !== this.elementCount || this.workingGroupsList[i].reduce(function(a,b) { return a + b}, 0) !== this.target) {
				return false;
			}
		}
		return true;
	}

	setPuzzle(difficulty, target, groups, gCount, elCount, numbers) {
		this.difficulty = difficulty;
		this.groupList = groups;
		this.target = target;
		this.groupsCount = gCount;
		this.elementCount = elCount;
		this.numbers = numbers;
		this.workingNumberPool = numbers;
		this.workingGroupsList.fill([], gCount - 1);
	}

}

