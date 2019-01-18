"use strict";

var router = require("express").Router();
var GameModel = require("../models/GameModel");
var CardsModel = require("../models/CardsModel");
var PlayersModel = require("../models/PlayersModel");
var ActivityModel = require("../models/ActivityModel");
var async = require("async");

router.route("/players").get((req, res) => {
  PlayersModel.find((err, players) => {
    res.json(players);
  });
});

router.route("/create").post((req, res) => {
  if (!req.body.created_by || req.body.created_by === "") {
    res.json({
      error: "Missing string field: created_by"
    });
  } else if (!req.body.players || req.body.players.length === 0) {
    res.json({
      error: "Missing array field: players"
    });
  } else {
    var new_game = new GameModel(req.body);
    var players_series = [];
    var players = [];
    var playersWithCards = [];
    CardsModel.find((err, cards) => {
      var shuffled_cards = shuffle(cards);
      new_game.hidden_card = shuffled_cards.hidden_card;
      new_game.players.forEach(player => {
        playersWithCards.push({
          user_id: player,
          cards: splitCards(shuffled_cards.cards, new_game.players, player)
        });
      });
      var isPlayer1 = true;
      playersWithCards.forEach(player => {
        players_series.push(function (cb) {
          PlayersModel.findByIdAndUpdate(
            player.user_id, {
              current_game: {
                game_id: new_game._id,
                cards: player.cards
              }
            },
            (err, pl) => {
              players.push({
                user_id: pl._id,
                name: pl.name,
                status: 0,
                isTurn: isPlayer1
              });
              isPlayer1 = false
              cb();
            }
          );
        });
      });
      async.series(players_series, err => {
        new_game.players = players;
        new_game.save(err => {
          if (err) {
            res.json({
              error: err
            });
          } else {
            res.json({
              message: "Successfully created a game",
              model: new_game
            });
          }
        });
      });
    });
  }
});

function shuffle(cards) {
  var currentIndex = cards.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
  var random_index = Math.floor(Math.random() * 51);
  var hidden_card = cards[random_index];
  console.log("hidden card: " + hidden_card);
  cards.splice(random_index, 1);
  return {
    hidden_card: hidden_card,
    cards: cards
  };
}

function splitCards(cards, players, player) {
  var splitArrLength = Math.floor(cards.length / players.length);
  var player_index = players.findIndex(function (pl) {
    return pl === player;
  });
  var start_loop = splitArrLength * player_index;
  var end_loop = start_loop + splitArrLength;
  if (players.length - 1 === player_index) end_loop = cards.length;
  var player_deck = [];
  for (let a = start_loop; a < end_loop; a++) {
    player_deck.push(cards[a]);
  }
  return player_deck;
}

router.route("/:id").post((req, res) => {
  // req.body.card
  PlayersModel.findById(req.params.id, (err, player) => {
    if (player) {
      GameModel.findById(player.current_game.game_id, (err, game) => {
        if (game) {
          var player_index = game.players.findIndex(pl => {
            return pl.user_id.toString() === player._id.toString();
          });
          if (game.players[player_index].isTurn) {
            var player2_index = player_index + 1;
            while (!game.players[player2_index] ||
              game.players[player2_index].status > 0) {
              player2_index = game.players[player2_index] ? player2_index + 1 : 0
            }
            console.log("players: " + player2_index + ":" + player_index);
            if (player2_index !== player_index) {
              CardsModel.findById(req.body.card, (err, card) => {
                console.log('card:' + JSON.stringify(req.body.card))
                if (card) {
                  var new_cards = [];
                  player.current_game.cards.forEach(crd => {
                    if (crd._id.toString() !== card._id.toString()) {
                      new_cards.push(crd);
                    } else {
                      console.log(crd._id);
                    }
                  });
                  PlayersModel.findByIdAndUpdate(
                    req.params.id, {
                      "current_game.cards": new_cards
                    }, {
                      new: true
                    },
                    (err, player1) => {
                      console.log("player1: " + player2_index + JSON.stringify(player1));

                      PlayersModel.findByIdAndUpdate(
                        game.players[player2_index].user_id, {
                          $push: {
                            "current_game.cards": card
                          }
                        },
                        (err, player2) => {
                          var activity = new ActivityModel();
                          activity.game = game._id;
                          activity.player = {
                            from: player1._id,
                            to: player2._id
                          };
                          activity.save(err => {
                            nextTurn(game, player2_index, (err, result) => {
                              if (new_cards.length === 0) {
                                var updated_players = [];
                                game.players.forEach(player => {
                                  if (player.user_id.toString() === req.params.id.toString()) {
                                    player.status = 1;
                                  }
                                  updated_players.push(player);
                                });
                                GameModel.findByIdAndUpdate(
                                  player.current_game.game_id, {
                                    players: updated_players
                                  },
                                  (err, updated_game) => {
                                    console.log(JSON.stringify(updated_game));
                                    res.json({
                                      message: "Great ! You win on this match",
                                      hidden_card: game.hidden_card
                                    });
                                  }
                                );
                              } else {
                                res.json(player1);
                              }
                            })
                          });
                        }
                      );
                    }
                  );
                } else {
                  res.status(400).json({
                    message: 'Invalid Request. card is required.'
                  })
                }
              });
            } else {
              res.json({
                message: "Sorry ! You lose. You got the pair of the hidden card.",
                hidden_card: game.hidden_card
              });
            }
          } else {
            res.json({
              message: "Oops. It's not your turn"
            })
          }
        }
      });
    } else {
      res.status(400).json({
        message: 'Invalid Request. User ID is required.'
      })
    }
  });
});

function nextTurn(game, player2_index, cb) {
  var updated_players = [];
  for (let a = 0; a < game.players.length; a++) {
    var pl = game.players[a];
    if (player2_index === a) {
      pl.isTurn = true;
    } else {
      pl.isTurn = false;
    }
    updated_players.push(pl)
  }
  GameModel.findByIdAndUpdate(game._id, {
    players: updated_players
  }, {
    new: true
  }, (err, game) => {
    cb(err, game)
  })
}

module.exports = router;