'use strict'

//DB connection
// =============================================================================
var mongoose = require('mongoose');
var constants_helper = require('./constants_helper');
mongoose.Promise = require('bluebird');

function connect() {
    mongoose.connect(constants_helper.mongodb_uri, {
            useMongoClient: true,
            promiseLibrary: require('bluebird')
        })
        .then(() => console.log('connection succesful'))
        .catch((err) => console.error(err));
}

module.exports = {
    connect: connect,
    db: mongoose
};