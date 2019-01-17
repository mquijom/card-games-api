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
        cards: [{
            __v: {
                type: String
            },
            card: {
                type: String
            },
            sign: {
                type: String
            },
            _id: {
                type: String
            }
        }]
    },
    games_history: []
})

module.exports = mongoose.model("players", PlayersModelSchema);