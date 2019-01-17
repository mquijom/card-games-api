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

// SETUP CORS
//#############################################################################
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS ");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access_token,Access-Control-Max-Age"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,access_token,Access-Control-Max-Age"
  );
  // res.setHeader("Access-Control-Allow-Credentials", true);
  console.log("token : " + req.headers);
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/api/cards", require("./api/routes/cards_router"));
app.use("/api/play", require("./api/routes/play_router"));
app.use("/api/users", require("./api/routes/users_router"));

// DB Connection
//#############################################################################
require("./api/utils/db_helper").connect();

module.exports = app;
