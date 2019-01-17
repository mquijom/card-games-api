"use strict";

var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");

var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: "false"
    })
);

app.use('/api/cards', require('./api/routes/cards_router'))
app.use('/api/play', require('./api/routes/play_router'))
app.use('/api/users', require('./api/routes/users_router'))

// DB Connection
//#############################################################################
require("./api/utils/db_helper").connect();

module.exports = app;