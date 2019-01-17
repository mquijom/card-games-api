"use strict";

var mongodb_uri = 'mongodb://heroku_hg7w9btc:pk2qmot0qg7ihlep1stg9hu1p7@ds157654.mlab.com:57654/heroku_hg7w9btc'

module.exports = {
    mongodb_uri: process.env.MONGODB_URI || mongodb_uri,
    home_url: "https://ccci-cards.herokuapp.com/"
}