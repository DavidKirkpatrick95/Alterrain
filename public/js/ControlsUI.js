//Controls UI constructor
function ControlsUI(game, x, y){
    this.game = game;
    this.x = x || 0;
    this.y = y || 0;
    
    this.screenShader = game.add.sprite(0, 0, "screenShader");
    this.screenShader.scale.x = game.world.width;
    this.screenShader.scale.y = game.world.height;
    this.screenShader.tint = 0x5d2c28;
    
    this.offsetY = 110;
    this.marginY = 60;
    
    this.titleText = game.add.bitmapText(x + GAME_WIDTH / 2, y + this.offsetY / 3 * 2, "m5x7", "============CONTROLS============", 48);
    this.titleText.anchor.setTo(0.5);
    
    this.movementText = game.add.bitmapText(x + GAME_WIDTH / 2 + 56, y + this.offsetY + this.marginY - 12, "m5x7", "- move", 48);
    this.movementText.anchor.setTo(0.5);
    
    this.interactText = game.add.bitmapText(x + GAME_WIDTH / 2 + 28, y + this.offsetY + (2 * this.marginY), "m5x7", "- interact with objects", 48);
    this.interactText.anchor.setTo(0.5);
    
    this.placeText = game.add.bitmapText(x + GAME_WIDTH / 2 + 36, y + this.offsetY + (3 * this.marginY), "m5x7", "- place tiles", 48);
    this.placeText.anchor.setTo(0.5);
    
    this.makeSoundText = game.add.bitmapText(x + GAME_WIDTH / 2 + 18, y + this.offsetY + (4 * this.marginY), "m5x7", "- make a sound", 48);
    this.makeSoundText.anchor.setTo(0.5);
    
    this.zIcon = game.add.sprite(this.interactText.x - this.interactText.width / 2 - 52, 
                                     this.interactText.y - this.interactText.height + 4, "zIcon");
    this.spaceIcon = game.add.sprite(this.placeText.x - this.placeText.width / 2 - 112, 
                                     this.placeText.y - this.placeText.height + 4, "spaceIcon");
    this.arrowKeysIcon = game.add.sprite(this.movementText.x - this.movementText.width / 2 - 124, 
                                     this.movementText.y - this.movementText.height - 32, "arrowKeysIcon");
    this.eIcon = game.add.sprite(this.makeSoundText.x - this.makeSoundText.width / 2 - 52, 
                                     this.makeSoundText.y - this.makeSoundText.height, "eIcon");
}

ControlsUI.prototype.destroy = function(){
    this.screenShader.destroy();
    this.titleText.destroy();
    this.movementText.destroy();
    this.interactText.destroy();
    this.placeText.destroy();
    this.makeSoundText.destroy();
    this.zIcon.destroy();
    this.spaceIcon.destroy();
    this.arrowKeysIcon.destroy();
}