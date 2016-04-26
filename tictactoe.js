/*
	I. Data Structure - Use an Array to store current board configuration. 
	II. Game Data - Track User Turn, Cross or Circle, number of tiles filled, etc.
	III. AI as a class? with a function utilizing a structure of nesting-arrays to store states of the board.
		-Let's have 2 bots, with an option to switch between the bot AIs.
	IV. Game Logics, Win Conditions, etc.
*/
var playerIcon;			//values are either circle or cross.
var aiIcon;
var playerTurn;			//whether it is the player's turn to go.
var currAI;					//Set which AI is desired....			set default to the medium difficulty AI?	
var currBoard=[];		//stores current board Info
var numPlaced;
var gameOver;
/*
	Current Board stored as an array of 0-8, with values O for X,	0 for unfilled, O for O
	
	Winning conditions is a 2 level array, with each inner array representing a set of winning indices.
*/		
var winConfigs=[[0,1,2],[3,4,5],[6,7,8],  [0,3,6],[1,4,7],[2,5,8],  [0,4,8],[2,4,6]];
var DefaultAI=function(){	//GODAAANMNNNLJAS:LKJDFA: this is AI is hard. why doesn't javascript have TREEES
	/*
		-This will be the construction of the default AI. it will have a datastructure (a nested array/Object..) for the possible outcomes of board constructions.
		-and also have a update(newBoard) function which can be called after the PLAYER makes a move, the default AI receives the newBoard and updates its functions again,
		-maybe a calculateBestMove() that returns a INTEGER representing the position to place on., a constructor 
	*/
	this.chooseMove=function(){
		
		/*
			the AI should 
			1. change this.boardTree.
			2. use evaluateNode() to find the best board available.
			3. find which position is placed in to result in the board.
			4. place move with placeMove()
			
		*/
		this.boardTree=new this.ConfigTreeNode(currBoard);
		this.boardTree.getPossibleConfigs();
		var availMoves=this.boardTree.possibleBoards.slice();

		if(availMoves.length!==0){
			var bestIndex=0;
			var bestValue=-99999;
			for(var index in availMoves){	//should check if any moves directly result in win.
				var tempBoard=availMoves[index];
				var tempVal=this.evaluateNode(tempBoard);
				if(checkBoard(tempBoard.board)===aiIcon){
					bestValue=99999;
					bestIndex=index;
				}
				else if(tempVal>bestValue){
					bestValue=tempVal;
					bestIndex=index;
				}
			}
			//at this point, bestIndex has been determined.
			var bestBoard=availMoves[bestIndex].board;
			var bestPos=-1;
			//compare bestBoard to currentBoard. which should be just 1 step different.
			for(var index in bestBoard){
				if(bestBoard[index]!==currBoard[index]){
					bestPos=index;
					break;
				}
			}
			//here found the move... lets place it.
			placeMove(bestPos);
			
		}
		
	}
	this.ConfigTreeNode=function(boardConfig){	//this is the node class structure. it should store its own board, and array of possible boards.
	//Here are the Data stored in each node.
		this.board=boardConfig.slice();		//Assigns the board configurations.
		this.possibleBoards=[];
		this.currentDepth=0;

		//this is the function that is used to recursively get all possible configTreeNodes
		this.getPossibleConfigs=function(){	//given a configuration, assign to it all the possible configurations next. RECURSIVE
		//first check if configNode's currentConfig is full
			var availPos=[];
			for(var index in this.board){
				if(this.board[index]===0){
					availPos.push(index);
				}
			}
			if(availPos.length!=0&&checkBoard(this.board)===0&&this.currentDepth<5){	//for each of the vals		//Should also check if current board is ended.
				/*	For each:
					1 - Make the new board
					2 - make the new configTreeNode with the newBoard
					3 - getPossibleConfigs of that Node
					4 - Add node to possibleBoards.
				*/
				for(var index in availPos){
					var pos=availPos[index];
					var newBoard=this.board.slice();
					newBoard[pos]=this.icon;				//newBoard is set....
					var newConfigNode=new currAI.ConfigTreeNode(newBoard);
					newConfigNode.getPossibleConfigs();		
					this.possibleBoards.push(newConfigNode);
				}
			}
		};	
		//here's the action part. lets find out what icon we're going with rn.
		var thisNumPlaced=0;
		var numX=0;	var numO=0;
		this.board.map(function(val){
			if(val==="X"){
				thisNumPlaced++;
				numX++;
			}else if(val==="O"){
				thisNumPlaced++;
				numO++;
			}
		});
		
		this.currentDepth=thisNumPlaced-numPlaced;
		this.icon;			//this.icon represents what icon we're putting in now.
		if(numX===numO){
			this.icon="O";
		}else{
			this.icon="X";
		}
		
	};
	this.updateTree=function(){
		//This function updates the tree structure of the boards.
	};
	this.evaluateNode=function(currNode){	//take the possibleBoards...
		/*returns the position to place next move onto. after evaluating using DFS across all the nodes. 
			-currMoves is a ConfigTreeNode
			-1 for tie, +3 for win, -3 for loss.
		*/
		var currNodeBoard=currNode.board.slice();
		var currMoves=currNode.possibleBoards.slice();
		var nodeValue=0;
		var nodeIcon;				//the icon of the player who made the move to create this board.
		if(currNode.icon==="X"){
			nodeIcon="O";
		}else nodeIcon="X";	
		if(currMoves.length===0){	//Base cases.
			//At this point, check if this board is a tie, a loss or a win.
			var retrievedValue=checkBoard(currNodeBoard);	//-1 if tie, else if not 0, should return the winner icon.
			if(retrievedValue===-1){	//if it's a tie, value = 1.
				nodeValue=0;
			}else if(retrievedValue!==0){
				if(retrievedValue===aiIcon){
					nodeValue=3;
				}else if(retrievedValue===playerIcon){
					nodeValue=-5;
				}
			}
		}else{
			for(var index in currMoves){
				nodeValue+=this.evaluateNode(currMoves[index]);
			}
		}
		return nodeValue;
	};
	
	//Constructor.
	this.boardTree=new this.ConfigTreeNode(currBoard);			//use this to access it.
	
}
var HardcoreAI=function(){
	/*
		This will be the construction of the hardcore AI. Uses a logic less related to probability
	*/
}
var EasyAI=function(){
	/*
		This ai doesn't need data structures, randomly places on a position.
	*/
}
function checkBoard(theBoard){	//Checks current Board to see if someone WON or TIED.				Return -1 if tie, 0 can continue		icon (O or X) if won.
	
	//Alg- go through each of the win Configs and see if It is met.
	for(var i=0;i<winConfigs.length;i++){
		var tempConfig=winConfigs[i];
		if(theBoard[tempConfig[0]]!==0&&theBoard[tempConfig[0]]===theBoard[tempConfig[1]]&&theBoard[tempConfig[0]]===theBoard[tempConfig[2]]){
			//winning condition met....
			//gameEnd(theBoard[tempConfig[0]]);
			return theBoard[tempConfig[0]];
		}
	}
	//If it gets here, winning condition isn't met. now if the board is filled up, it is a tie.
	var isTie=true;
	for(var i=0;i<theBoard.length;i++){
		if(theBoard[i]===0){	//if there is an unfilled tile still, game isn't ended. therefore isTie=false.
			isTie=false;
		}
	}
	if(isTie){
		return -1;
	}
	return 0;
}
function gameEnd(winnerIcon){
	/*
		1 - Declares Winner
		2 - Reset Game
	*/
	if(winnerIcon==="Tie"){
			$("#modal-prompt").html("Tie!");
	}else{
		if(winnerIcon===playerIcon){
			$("#modal-prompt").html("You've Won!");
		}else if(winnerIcon===aiIcon){
			$("#modal-prompt").html("The AI defeated you mercilessly!");
		}
	}
	gameOver=true;
	$("#myModal").modal("show");
}
function placeMove(position){			//method used to place a move for both AI and the PLAYER.
	var tileID="position"+position;	
	//place the move... If the tile is EMPTY .		--> place the current move's Icon
	if(currBoard[position]===0&&gameOver===false){
		numPlaced++;
		if(playerTurn){
			currBoard[position]=playerIcon;
			playerTurn=false;
			document.getElementById(tileID).innerHTML=playerIcon;
			//AI move...
		}else{
			currBoard[position]=aiIcon;
			playerTurn=true;
			document.getElementById(tileID).innerHTML=aiIcon;
		}
		var boardResult=checkBoard(currBoard);		//Checks if a winning condition is met.
		if(boardResult===-1){
			gameEnd("Tie");
		}
		else if(boardResult!==0){	//if ===0 do nothing		if not 0, then it is a winning boad.. return is an icon.
			gameEnd(boardResult);
		}else{// if it === 0.
			if(playerTurn===false){
				currAI.chooseMove();
			}
		}
	}
}
function chooseIcon(chosenIcon){
	playerIcon=chosenIcon;
	if(chosenIcon==="X"){
		aiIcon="O";
	}else if(chosenIcon==="O"){
		aiIcon="X";
	}
	resetBoard();
	game();
}
function switchAI(selectedAI){
	if(selectedAI==="hardcore"){
		//set hardcoreAI
	}else if(selectedAI==="default"){
		
		//set defaultAI;
		currAI=new DefaultAI();
		console.log("chosen default AI");
	}else{
		//blah.
	}
}
function game(){
	//do game stuff.
	if(playerTurn===false){
		currAI.chooseMove();
	}
}
function resetBoard(){
	gameOver=false;
	numPlaced=0;
	currBoard=[0,0,0,0,0,0,0,0,0];
	switchAI("default");
	for(var i=0;i<currBoard.length;i++){
		document.getElementById("position"+i).innerHTML="";
	}
	if(playerIcon==="O"){
		playerTurn=true;
	}else playerTurn=false;
	game();
}

$(document).ready(function(){		//Set-up
	$("#myModal").modal("show");



});