"use strict";

var router = require("express").Router();
var PlayersModel = require("../models/PlayersModel");

router.route('/:user').get((req, res) => {
    PlayersModel.findOne({
        name: req.params.user
    }, (err, player) => {
        if (player) {
            player.current_game = null;
            player.games_history = null;
            res.status(200).json(player)
        } else {
            res.status(403).json({
                message: 'Invalid Request. User does not exist'
            })
        }
    })
})

module.exports = router;