//The main menu state
var MainMenuState = function(game){
    this.textStyle = {font: "32px Arial", fill: "#FFF"};
};

MainMenuState.prototype = {
    init: function(){
        //Make sure the game continues running when out of focus
        game.stage.disableVisibilityChange = true;
        
        //To make sure any pixel art that's scaled doesn't become blurry
        game.stage.smoothed = false
        
        this.titleText = game.add.text(GAME_WIDTH / 2, 180, "Alterrain", this.textStyle);
        this.titleText.anchor.setTo(0.5);
        
        this.promptText = game.add.text(GAME_WIDTH / 2, 300, "Press Enter to Join", this.textStyle);
        this.promptText.anchor.setTo(0.5);
    },

    preload: function(){
        game.load.spritesheet("player", "./assets/img/person_spritesheet_large.png", 32, 32);
        game.load.image("gameTileset", "./assets/img/game_tileset.png", 32, 32);
        game.load.image("arrowIcon", "./assets/img/arrow.png", 32, 32);
        game.load.image("soundIcon", "./assets/img/sound.png", 64, 32);
        game.load.image("willowTree", "./assets/img/willowtree.png", 32, 32);
        
        game.load.audio("placeTileSound", ["assets/audio/place_tile.ogg", "assets/audio/place_tile.mp3"]);
        game.load.audio("abstractChirpSound", ["assets/audio/abstract_chirp01.ogg", "assets/audio/abstract_chirp01.mp3"]);
    },

    create: function(){
        game.stage.backgroundColor = "#222";

        //Center the game
        game.scale.pageAlignHorizontally = true;
    },

    update: function(){
        if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)){
            game.state.start("GameplayState");
        }
    }
}
