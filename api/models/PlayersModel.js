'use strict'

var mongoose = require("mongoose");

var PlayersModelSchema = new mongoose.Schema({
    name: {
        type: String
    },
    current_game: {
        game_id: {
            type: String
        },
        cards: []
    },
    games_history: []
})

module.exports = mongoose.model("players", PlayersModelSchema);