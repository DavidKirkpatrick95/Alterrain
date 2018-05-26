//The main menu state
var MainMenuState = function(game){
    //this.textStyle = {font: "32px Arial", fill: "#FFF"};
};

MainMenuState.prototype = {
    init: function(){
        //Make sure the game continues running when out of focus
        game.stage.disableVisibilityChange = true;
        
        //To make sure any pixel art that's scaled doesn't become blurry
        game.stage.smoothed = false
    },

    preload: function(){
        game.load.bitmapFont("m5x7", "assets/font/m5x7.png", "assets/font/m5x7.fnt");
        
        game.load.spritesheet("player", "./assets/img/person_spritesheet_large.png", 32, 32);
        game.load.spritesheet("treasureChest", "./assets/img/treasurechest_spritesheet.png", 32, 32);
        game.load.spritesheet("willowTree", "./assets/img/willow_spritesheet.png", 32, 32);
        game.load.image("gameTileset", "./assets/img/game_tileset.png", 32, 32);
        game.load.image("arrowIcon", "./assets/img/arrow.png", 32, 32);
        game.load.image("soundIcon", "./assets/img/sound.png", 64, 32);
        game.load.image("inventoryUI", "./assets/img/inventory_ui.png", 48, 128);
        game.load.image("highlightUI", "./assets/img/highlight_ui.png", 37, 34);
        //game.load.image("willowTree", "./assets/img/willowtree.png", 32, 32);
        
        game.load.image("raindrop", "assets/img/raindrop.png");
        game.load.image("screenShader", "assets/img/screen_shader.png");
        
        game.load.audio("placeTileSound", ["assets/audio/place_tile.ogg", "assets/audio/place_tile.mp3"]);
        game.load.audio("abstractChirpSound", ["assets/audio/abstract_chirp01.ogg", "assets/audio/abstract_chirp01.mp3"]);
        game.load.audio("pickupLootSound", ["assets/audio/pickup_loot01.ogg", "assets/audio/pickup_loot01.mp3"]);
        
        game.load.audio("treeCutSound", ["assets/audio/chop01.ogg", "assets/audio/chop01.mp3"]);
        game.load.audio("treeDestroyedSound", ["assets/audio/creak01.ogg", "assets/audio/creak01.mp3"]);
        
        game.load.audio("grassFootsteps", ["assets/audio/grass_footsteps.ogg", "assets/audio/grass_footsteps.mp3"]);
        game.load.audio("sandFootsteps", ["assets/audio/sand_footsteps.ogg", "assets/audio/sand_footsteps.mp3"]);
        game.load.audio("stoneFootsteps", ["assets/audio/stone_footsteps.ogg", "assets/audio/stone_footsteps.mp3"]);
    },

    create: function(){        
        this.titleText = game.add.bitmapText(GAME_WIDTH / 2, 180, "m5x7", "Alterrain", 64);
        this.titleText.anchor.setTo(0.5);
        
        this.promptText = game.add.bitmapText(GAME_WIDTH / 2, 300, "m5x7", "Press Enter to Join", 64);
        this.promptText.anchor.setTo(0.5);

        //Center the game
        game.scale.pageAlignHorizontally = true;
    },

    update: function(){
        if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)){
            game.state.start("GameplayState");
        }
    }
}
