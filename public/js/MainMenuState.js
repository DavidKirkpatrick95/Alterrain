//The main menu state
var MainMenuState = function(game){};

MainMenuState.prototype = {
    init: function(){
        //Make sure the game continues running when out of focus
        game.stage.disableVisibilityChange = true;
    },

    preload: function(){
        game.load.spritesheet("player", "assets/img/dude.png", 32, 48);
    },

    create: function(){
        console.log("This is the main menu");

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
