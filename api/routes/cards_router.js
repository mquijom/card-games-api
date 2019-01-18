"use strict";

var router = require("express").Router();
var cards = [
    "Ace",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Jack",
    "Queen",
    "King"
];
var signs = ["Club", "Diamond", "Heart", "Spade"];
var CardsModel = require("../models/CardsModel");
var PlayersModel = require("../models/PlayersModel");
var GameModel = require('../models/GameModel')
var async = require('async')

// router.route('/').get((req, res) => {
//     var cards_series = [];
//     var cards_results = [];
//     for (let a = 0; a < cards.length; a++) {
//         for (let b = 0; b < signs.length; b++) {
//             cards_series.push(function (cb) {
//                 var card_code = getCode(a + 1);
//                 var card_sign_code = card_code + signs[b].charAt(0);
//                 var card = new CardsModel();
//                 card.card = cards[a];
//                 card.sign = signs[b];
//                 console.log(card_sign_code)
//                 card.image_url = "https://deckofcardsapi.com/static/img/" + card_sign_code + ".png"
//                 card.code = card_sign_code;
//                 card.save(err => {
//                     cards_results.push(card);
//                     cb()
//                 })
//             })
//         }
//     }
//     async.series(cards_series, (err) => {
//         res.json(cards_results);
//     })
// })

function getCode(num) {
    if (num === 1) {
        return 'A'
    } else if (num === 10) {
        return '0'
    } else if (num === 11) {
        return 'J'
    } else if (num === 12) {
        return 'Q'
    } else if (num === 13) {
        return 'K'
    } else {
        return num.toString()
    }
}

router.route('/isturn/:id').get((req, res) => {
    PlayersModel.findById(req.params.id, (err, player) => {
        GameModel.findById(player.current_game.game_id, (err, game) => {
            var players_turn = "";
            game.players.forEach(pl => {
                if (pl.isTurn) {
                    players_turn = pl.name.toString();
                }
            })
            res.json({
                players_turn: players_turn
            })
        })
    })
})

router.route("/:id").get((req, res) => {
    PlayersModel.findById(req.params.id, (err, player) => {
        if (player) {
            player.current_game.total_cards = player.current_game.cards.length
            console.log(player.current_game.cards.length)
            res.status(200).json({
                model: player,
                total_cards_onhand: player.current_game.cards.length
            })
        } else {
            res.status(400).json({
                message: 'Invalid Request. User ID is required.'
            })
        }
    })
});

router.route("/pair/:id").get((req, res) => {
    PlayersModel.findById(req.params.id, (err, player) => {
        if (player) {
            var updated_cards = eliminatePairCards(player.current_game.cards)
            PlayersModel.findByIdAndUpdate(req.params.id, {
                'current_game.cards': updated_cards
            }, (err, updated_player) => {
                console.log(JSON.stringify(updated_player))
                if (updated_cards.length === 0) {
                    GameModel.findById(player.current_game.game_id, (err, game) => {
                        if (game) {
                            var updated_players = []
                            var search_next_turn = false;
                            game.players.forEach(player => {
                                player.isTurn = false;
                                if (player.user_id.toString() === req.params.id.toString()) {
                                    player.status = 1
                                    search_next_turn = true
                                } else if (search_next_turn && player.status === 0) {
                                    player.isTurn = true;
                                    search_next_turn = false;
                                }
                                updated_players.push(player)
                            })
                            GameModel.findByIdAndUpdate(player.current_game.game_id, {
                                players: updated_players
                            }, (err, updated_game) => {
                                console.log(JSON.stringify(updated_game))
                                res.json({
                                    message: "Great ! You win on this match"
                                })
                            })
                        }
                    })
                } else { //check if there is still opponent
                    GameModel.findById(player.current_game.game_id, (err, game) => {
                        var stillHaveAChance = false;
                        game.players.forEach(pl => {
                            if (pl.user_id.toString() !== player._id.toString() && pl.status === 0) {
                                stillHaveAChance = true;
                            }
                        })
                        if (stillHaveAChance) {
                            res.json({
                                message: "Successfully paired"
                            })
                        } else {
                            res.json({
                                message: "Sorry ! You lose. You got the pair of the hidden card.",
                                hidden_card: game.hidden_card
                            });
                        }
                    })
                }
            })
        } else {
            res.status(400).json({
                message: 'Invalid Request. User ID is required.'
            })
        }
    })
});

function eliminatePairCards(cards) {
    for (let a = 0; a < cards.length; a++) {
        for (let b = a + 1; b < cards.length; b++) {
            if (cards[a].card === cards[b].card) {
                cards.splice(a, 1)
                cards.splice(b - 1, 1)
                a--
                break;
            }
        }
    }
    return cards
}

module.exports = router;