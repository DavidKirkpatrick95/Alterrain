'use strict';

const path = require('path');
const fs = require('fs');

const EventEmitter = require('events');
const Character = require('./character');
const Player = require('./player.js');
const noise = require('../lib/perlin.js');

const {Tiles, TileData, WorldConfig} = require('../../shared/constant.js');
const logger = require('../logger.js');

/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
class World {
  /**
   * @param server{Server}
   * @param filename {String=}
   */
  constructor(server, filename) {
    this.server = server;

    /**
     * @type {Map<Number, Character>}
     */
    this.objects = new Map();
    this.stepCount = 0;

    this.width = WorldConfig.WIDTH;
    this.height = WorldConfig.HEIGHT;


    this.initWorldData(filename);

    this.setupEventEmitter();
  }

  /**
   * Initialized the game world either by existing data or generate new.
   * @param filename {String=}
   * @return {boolean}
   */
  initWorldData(filename = null) {
    let success = false;
    if (typeof filename === 'string') {
      this.tileMap = this.loadFromDiskData(filename);
      if (this.tileMap) {
        logger.info(`Successfully loading world data from ${filename}`);
        return success = true;
      }
    }

    logger.info('Creating new Tilemap...');
    this.initTilemap();
    this.initObjectMap();
    this.saveWorldDataToDisk();
    return success;
  }

  /**
   * Register handlers for an event
   * @private
   */
  setupEventEmitter() {
    let emitter = new EventEmitter();

    this.on = emitter.on;
    this.once = emitter.once;
    this.removeListener = emitter.removeListener;

    this.emit = emitter.emit;
  }

  /**
   * Save a world snapshot to the local disk.
   */
  saveWorldDataToDisk() {
    let d = new Date();
    let filename = `world-${d.getDay()}-${d.getHours()}-${d.getSeconds()}.json`;
    let resolvedPath = path.join(__dirname, '../../data', filename);
    let data = JSON.stringify(this.tileMap);

    fs.writeFile(resolvedPath, data, (err) => {
      if (err) {
        return logger.error(`Unable to Save world data: ${resolvedPath}`);
      }
      logger.info(`World snapshot saved: ${resolvedPath}`);
    });
  }

  /**
   * @param filename {String}
   * @return {Array.<Array.<Number>>}
   */
  loadFromDiskData(filename) {
    let resolvedPath = path.join(__dirname, '../../data', filename);

    let mapData = null;

    // fs.readFile(resolvedPath, (err, data) => {
    //     if (err) {
    //       return logger.error(`Unable to Read world data: ${resolvedPath}`);
    //     }
    //
    //     mapData = JSON.parse(data);
    //   }
    // );

    try {
      mapData = JSON.parse(fs.readFileSync(resolvedPath));
    } catch (err) {
      logger.error(`Unable to Read world data: ${resolvedPath}`);
      logger.error(err);
    }

    return mapData;
  }

  /**
   * @private
   */
  initTilemap() {
    // The game world represented in a 2D array
    // 0 = grass
    // 1 = sand
    // 2 = stone - temp
    // 3 = water - can not pass
    this.tileMap = [];

    // The heightmap, used to procedurally generate the tilemap
    this.heightmap = [];

    // The moisture, used to procedurally generate the tilemap
    this.moisture = [];

    for (let i = 0; i < this.height; i++) {
      this.tileMap[i] = [];
      this.heightmap[i] = [];
      this.moisture[i] = [];
    }

    this.generateNoise(this.heightmap, this.width, this.height);
    this.generateNoise(this.moisture, this.width, this.height);
    this.generateTileMap(this.tileMap, this.heightmap, this.moisture);
  }
  
  /**
   * @private
   */
  initObjectMap() {
    // The solid objects represented in a 2D array
    // 0 = trees
    // 1 = rocks (not ready)
    this.objectMap = [];

    for(let i = 0; i < this.height; i++){
      this.objectMap[i] = [];
    }

    this.generateTrees(this.tileMap, this.objectMap);
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @param playerId {Number}
   * @return {Map<Number, Character>}
   */
  addObject(x, y, playerId) {
    let player = new Player(this, x, y, playerId);
    return this.objects.set(playerId, player);
  }

  /**
   * temp
   * @deprecated
   * TODO: Make it proper
   */
  changeTile(x, y, tileId = Tiles.GRASS) {
    if (!this.isValidTile(x, y)) {
      logger.error(`Invalid tile position at (${x},${y})`);
      return;
    }

    logger.debug(`Tile at (${x}, ${y}) is changed to ${tileId}.`);

    this.tileMap[x][y] = tileId;

    this.server.io.emit('worldUpdate', {
      tiles: [[x, y, tileId]],
    });
  }

  /**
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  isValidTile(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * @param x {number}
   * @param y {number}
   * @param bit {number} Binary mask for direction.
   * @return {boolean}
   */
  checkPassage(x, y, bit) {
    let tile = this.tileMap[x][y];

    return TileData[tile] === 0;
  }
  
  /**
   * @param x {number}
   * @param y {number}
   * @param bit {number} Binary mask for direction.
   * @return {boolean}
   */
  checkObject(x, y, bit) {
    let obj = this.objectMap[x][y];
    //Undefined if empty
    return obj >= 0;
  }

  /**
   * @param x {number}
   * @param y {number}
   * @param d {number} Direction
   * @return {boolean}
   */
  isPassable(x, y, d) {
    return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f) && !this.checkObject(x, y, (1 << (d / 2 - 1)) & 0x0f);
  }

  /**
   * @param playerId {Number}
   * @return {boolean}
   */
  removeObject(playerId) {
    return this.objects.delete(playerId);
  }

  /**
   * @return {Array}
   */
  getTileMap() {
    return this.tileMap;
  }
  
  /**
   * @return {Array}
   */
  getObjectMap() {
    return this.objectMap;
  }

  /**
   * Main Update function
   * @param dt{Number}
   */
  step(dt) {
    this.objects.forEach((character)=>{
      character.update();
    });
  }

  /**
   * @param command {Function} Command Function
   */
  processInput(command) {
    command();
  }

  /** OLD - uses elevation only and returns only 3 biomes
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param e The 2D array that represents the elevation
   * @param m The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
  getBiomeType(e, m) {
      if (e < 0.4) {
          return 3; // water
      }
      if (e < 0.55) {
          return 1; // sand
      }
      if (e < 0.7) {
          return 0; // grass
      }
      return 2; // stone
  }

  /** USE THIS FUNCTION WHEN WE HAVE MORE BIOMES
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param e The 2D array that represents the elevation
   * @param m The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
  getBiomeTypeBetter(e, m) { // 0 = grass, 1 = sand, 2 = stone, 3 = water
    if (e < 0.1) {
        // ocean
        return 3;
    }
    if (e < 0.12) {
        // beach
        return 1;
    }
    if (e > 0.8) {
        if (m < 0.1) {
            // scorched
        }
        if (m < 0.2) {
            // bare
        }
        if (m < 0.5) {
            // tundra
            return 2;
        }
        // snow
        return 2;
    }
    if (e > 0.6) {
        if (m < 0.33) {
            // temperate desert
            return 1;
        }
        if (m < 0.66) {
            // shrubland
            return 0;
        }
        // taiga
        return 2;
    }
    if (e > 0.3) {
        if (m < 0.16) {
            // temperate desert
            return 1;
        }
        if (m < 0.5) {
            // grassland
            return 0;
        }
        if (m < 0.83) {
            // temperate deciduous forest
        }
        // temperate rain forest
    }
    if (m < 0.16) {
        // subtropical desert
        return 1;
    }
    if (m < 0.33) {
        // grassland
        return 0;
    }
    if (m < 0.66) {
        // tropical seasonal rainforest
    }
    // tropical rainforest
  }

  /**
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param arr The 2D array to fill
   * @param width The width of the 2D array
   * @param height The height of the 2D array
   */
  generateNoise(arr, width, height) {
    // let noise = new Noise();
    noise.seed(Math.random());
    // let freq = 1.2; //Frequency, should be a constant
    let freq = 2.2;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let nx = i / this.width - 0.5;
        let ny = j / this.height - 0.5;
        arr[i][j] = noise.perlin2(freq * nx, freq * ny)
                    + freq/2 * noise.perlin2(freq*2 * nx, freq*2 * ny)
                    + freq/4 * noise.perlin2(freq*4 + nx, freq*4 + ny);
        arr[i][j] = (arr[i][j] + 1) / 2;
      }
    }
  }

  /**
   * Creates the tilemap of the game world based on different
   * layers of noise
   * @param tilemap The 2D array to generate tiles in
   * @param heightmap A 2D array of noise representing elevation
   */
  generateTileMap(tilemap, heightmap, moisture) {
    // TODO properly generate the tilemap based on the heightmap
    // layer and other layers
    for (let i = 0; i < tilemap.length; i++) {
      for (let j = 0; j < tilemap.length; j++) {
        let e = heightmap[i][j];
        let m = moisture[i][j];
        let tileType = this.getBiomeType(e, m);
        tilemap[i][j] = tileType;
      }
    }
  }
  
  /**
   * Spawns trees around the world based on a given tilemap.
   * Will spawn trees on grass tiles only.
   * @param tilemap The 2D array that represents the world
   * @param objectMap The 2D array to store the trees in as integers
   */
  generateTrees(tilemap, objectMap) {
    //TODO use a better algorithm to spawn trees
    for (let i = 0; i < tilemap.length; i++) {
      for (let j = 0; j < tilemap.length; j++) {
        let tileType = tilemap[i][j];
        if(tileType === 0){ //grass
          if(Math.random() < 0.2){
            objectMap[i][j] = 0; //Set the object type as a tree
          }
        }
      }
    }
  }
}

module.exports = World;
