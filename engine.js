class Card {
    constructor(id, shape, number, name) {
        this.id = id;
        this.shape = shape;
        this.number = number;
        this.name = name;
        this.onPlaced = function (e) { };
        this.canBePlaced = function (e) { return true; };
    }
    getImage(){

    }
}
class Game {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.deck = [];
        this.discardPile = [];
        this.onPlayerJoin = function (e) { };
        this.onPlayerLeave = function (e) { };
    }
}
var hand = [];
var lastCard = null; 