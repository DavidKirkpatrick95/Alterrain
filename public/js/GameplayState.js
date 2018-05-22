//The main menu state
var GameplayState = function(game){
    //Create a playerMap property
    this.playerMap = {};
    //Make a reference to the local player
    this.player = null;

    //Create a 2D array for solid objects
    this.objectMap = [];
    for(let i = 0; i < 64; i++){ //TODO use a constant instead of 64 to reference the world size
        this.objectMap[i] = [];
    }

    //this.textStyle = {font: "20px Arial", fill: "#FFF"};
};

//Tile-based movement
var playerSpeed = 32;

var tileName = ["Grass", "Sand", "Stone", "Water", "Bridge"];

// We are using num-pad representation (Ivan)
//
var FACING_LEFT = 4;
var FACING_UP = 8;
var FACING_DOWN = 2;
var FACING_RIGHT = 6;

//How close the player needs to be, in pixels, to hear a sound play
var MIN_HEARING_DISTANCE = 600;
var TILE_SIZE = 32;

GameplayState.prototype = {
    init: function(){
      // --------------------------------------
      Client.connectToServer();
      // --------------------------------------
    },

    preload: function(){
        //empty
    },

    create: function(){
        this.createSoundObjects();

        //Set up and create the world tilemap
        //TODO use constants instead of hard-coded numbers
        game.world.setBounds(0, 0, 64 * TILE_SIZE, 64 * TILE_SIZE);
        this.tileGroup = game.add.group();
        this.tileMap = game.add.tilemap();
        this.tileMap.setTileSize(TILE_SIZE, TILE_SIZE);
        this.tileMap.addTilesetImage("gameTileset");
        //new Tilemap(layerName, widthInTiles, heightInTiles, tileWidth, tileHeight)
        this.mainLayer = this.tileMap.create("mainLayer", 64, 64, TILE_SIZE, TILE_SIZE);

        //TODO need to optimize later
        this.tileChoice = 0;

        //Handle input
        game.input.keyboard.onDownCallback = this.handleKeys;

        //Create a group for solid objects - to be drawn below UI
        this.solidObjectsGroup = game.add.group();

        //Create a group for player sprites - to be drawn below UI
        this.playersGroup = game.add.group();

        //Create a group for player icon sprites - drawn above players but below UI
        this.playerIconsGroup = game.add.group();

        //Create a group for UI elements
        this.uiGroup = game.add.group();
        this.uiGroup.fixedToCamera = true;
        
        //Create the inventoryUI
        this.playerInventoryUI = new InventoryUI(game, 120, 408, "inventoryUI");
        this.uiGroup.add(this.playerInventoryUI);
        for(let i = 0; i < this.playerInventoryUI.itemsText.length; i++){
            this.uiGroup.add(this.playerInventoryUI.itemsText[i]);
        }
        //this.uiGroup.add(this.playerInventoryUI.itemsText);

        //Display tile choice
        //TODO should be a proper UI instead
        this.tileText = game.add.bitmapText(32, 32, "m5x7", tileName[this.tileChoice], 48);
        this.uiGroup.add(this.tileText);
    },

    shutdown: function(){
        // --------------------------------------
        Client.disconnectFromServer();
        // --------------------------------------

    },

    update: function(){
        if(game.input.keyboard.justPressed(Phaser.Keyboard.ESC)){
            game.state.start("MainMenuState");
        }
    },

    createSoundObjects: function(){
        this.placeTileSound = game.add.audio("placeTileSound");
        this.abstractChirpSound = game.add.audio("abstractChirpSound");
        this.pickupLootSound = game.add.audio("pickupLootSound");
        this.treeCutSound = game.add.audio("treeCutSound");
        this.treeDestroyedSound = game.add.audio("treeDestroyedSound");
    },

    //Adds a new player object to the world
    addNewPlayer: function(id, x, y){
        this.playerMap[id] = new Player(game, x * TILE_SIZE, y * TILE_SIZE, "player");
        //game.add.existing(this.playerMap[id]);
        this.playersGroup.add(this.playerMap[id]);
        //Make sure the local player is drawn on top of other players
        if(this.player){
            this.player.bringToTop();
            //Make sure the UI stays on top
            if(this.uiGroup){
                game.world.bringToTop(this.uiGroup);
            }
        }
    },

    //Set the player reference to the correct player sprite object
    setPlayerReference: function(id){
        this.player = this.playerMap[id];
        this.player.enableArrowIcon();
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
        this.player.bringToTop();
        //Make sure the UI stays on top
        if(this.uiGroup){
            game.world.bringToTop(this.uiGroup);
        }
    },

    //Removes a player object from the world with the given id
    removePlayer: function(id){
        this.playerMap[id].destroy();
        delete this.playerMap[id];
    },

    handleKeys: function(e){
        //Emit signals only if the player isn't in the middle of moving already
        if(gameplayState.player && gameplayState.player.canMove){
            if(e.keyCode === Phaser.Keyboard.UP){
                Client.sendMove(8);
            }
            if(e.keyCode === Phaser.Keyboard.DOWN){
                Client.sendMove(2);
            }
            if(e.keyCode === Phaser.Keyboard.LEFT){
                Client.sendMove(4);
            }
            if(e.keyCode === Phaser.Keyboard.RIGHT){
                Client.sendMove(6);
            }
        }

        //Tile choosing controls
        if(e.keyCode === Phaser.Keyboard.ONE){
            this.tileChoice = 0; //grass
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }
        if(e.keyCode === Phaser.Keyboard.TWO){
            this.tileChoice = 1; //sand
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }
        if(e.keyCode === Phaser.Keyboard.THREE){
            this.tileChoice = 2; //stone
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }
        if(e.keyCode === Phaser.Keyboard.FOUR){
            this.tileChoice = 4; //bridge
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }

        //Change the tile the player is standing on
        //BUG - placing the same tile again shouldn't do anything
        if(e.keyCode === Phaser.Keyboard.SPACEBAR){
            Client.changeTile(this.tileChoice, gameplayState.player.facing);
        }

        //Interact with a treasure chest
        if(e.keyCode === Phaser.Keyboard.Z){
            Client.interact();
        }

        //Play abstract sound
        if(e.keyCode === Phaser.Keyboard.E){
            Client.playSound();
        }
    },
    
    updatePlayerInventory: function(playerId, inventory){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer === this.player){
            this.playerInventoryUI.updateDisplay(inventory);
        }
    },

    playAbstractSoundFrom: function(playerId){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer.canMakeSound){
            this.playSoundFrom(this.abstractChirpSound, sourcePlayer.x, sourcePlayer.y);
            sourcePlayer.startSoundTimer();
        }
    },

    //Moves the player to the given position
    movePlayer: function(id, x, y, d){
        //this.playerMap[id].x = x;
        //this.playerMap[id].y = y;
      // console.log(`${x},${y},${d}`)
      this.playerMap[id].setDirection(d);
        if(this.playerMap[id].ableToMove()){
            this.playerMap[id].moveTo(x * TILE_SIZE, y * TILE_SIZE);
        }
    },

    //Change the given tile to another type
    changeTileAt(tileX, tileY, tileType){
        if(tileX < 0 || tileX >= this.tileMap.width || tileY < 0 || tileY >= this.tileMap.height){
            console.log("invalid tile position");
            return;
        }
        let sourceX = tileX * TILE_SIZE;
        let sourceY = tileY * TILE_SIZE;
        this.playSoundFrom(this.placeTileSound, sourceX, sourceY);
        this.tileMap.putTile(tileType, tileX, tileY);
    },

    //Generates tile objects based on a given 2D tilemap
    //0 === grass
    //1 === sand
    //2 === stone
    generateTiles: function(tileMap){
        for(let i = 0; i < tileMap.length; i++){
            for(let j = 0; j < tileMap[i].length; j++){
                this.tileMap.putTile(tileMap[i][j], i, j);
            }
        }
    },

    //Generates solid objects based on a given 2D object map
    generateSolidObjects: function(objectMap){
        for(let i = 0; i < objectMap.length; i++){
            for(let j = 0; j < objectMap[i].length; j++){
                this.placeSolidObject(objectMap[i][j], i, j);
            }
        }
    },

    //Spawns treasure chests based on an array of them
    spawnTreasureChests: function(arr){
        for(let i = 0; i < arr.length; i++){
            this.objectMap[arr[i].x][arr[i].y] = new Treasure(game, arr[i].x * TILE_SIZE, arr[i].y * TILE_SIZE, "treasureChest");
            //TODO check if the treasure chest requires more than 1 player to open to set the correct sprite
            this.solidObjectsGroup.add(this.objectMap[arr[i].x][arr[i].y]);
        }
    },

    //Helper function for placing individual solid objects
    //0 === trees
    //1 === rocks
    placeSolidObject: function(objectType, tileX, tileY){
        if(objectType === 0){
            this.objectMap[tileX][tileY] = new Tree(game, tileX * TILE_SIZE, tileY * TILE_SIZE, "willowTree");
            this.solidObjectsGroup.add(this.objectMap[tileX][tileY]);
        }
        //Unfinished
        /*else if(objectType === 1){
            this.objectMap[tileX][tileY] = new Rock(game, tileX * TILE_SIZE, tileY * TILE_SIZE);
            game.add.existing(this.objectMap[tileX][tileY]);
        }*/
    },

    //Interact with a specific treasure chest
    interactWithChest: function(tileX, tileY, state){
        let treasureChest = this.objectMap[tileX][tileY];
        if(treasureChest){
            //New player unlocked 1 lock in this chest
            if(state === 0){
                console.log("Treasure found by unique player");
                //TODO play unlocking sound
                //treasureChest.frame--;
            }
            //Old player tried to interact with treasure chest, nothing happens
            if(state === 1){
                console.log("Player has already interacted with treasure chest.");
                //TODO play treasure chest locked sound effect
            }
            //Treasure chest's last lock opened
            if(state === 2){
                console.log("Treasure found by LAST unique player. Treasure is now open.");
                treasureChest.frame = 0;
                this.playSoundFrom(this.pickupLootSound, tileX * TILE_SIZE, tileY * TILE_SIZE);
            }
            // this.objectMap[tileX][tileY].unlock(state);
        }
    },
    
    //Cut a specific tree, playing a different sound depending on its remaining hitpoints
    cutTree: function(tileX, tileY, hitpoints){
        let tx = tileX * TILE_SIZE;
        let ty = tileY * TILE_SIZE;
        if(hitpoints > 0){
            this.playSoundFrom(this.treeCutSound, tx, ty);
        }
        else if(hitpoints === 0){
            this.playSoundFrom(this.treeDestroyedSound, tx, ty);
            let treeObj = this.objectMap[tileX][tileY];
            treeObj.cutDown();
        }
    },

    //Plays a given sound with volume inversely scaled to the distance from the source
    //TODO make the minimum hearing distance a variable instead
    playSoundFrom: function(sfx, x, y){
        let dist = this.getDistance(x, y, this.player.x, this.player.y);
        let factor = dist / MIN_HEARING_DISTANCE;
        if(factor > 1){
            factor = 1;
        }
        sfx.volume = 1 - factor;
        if(sfx.volume > 0){
            sfx.play();
        }
    },

    //Returns the distance between 2 points
    getDistance: function(x1, y1, x2, y2){
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}

