"use strict";

var router = require("express").Router();
var PlayersModel = require("../models/PlayersModel");

router.route('/:user').get((req, res) => {
    PlayersModel.findOne({
        name: req.params.user
    }, (err, player) => {
        res.json(player)
    })
})

module.exports = router;