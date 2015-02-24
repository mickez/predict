'use strict';

var _ = require('lodash');

var connection = require('./connection.js');
var data = require('./data.json');
var Word = require('./schemas/word.js');

function createWord(value, freq) {
    var word = new Word({value: value, freq: freq});
}

function calculateProbability(words) {
    var count = 0;

    _.forEach(words, function(word) {
        count += word.freq;
    });

    _.forEach(words, function(word) {
        word.prob = word.freq / count;
    });
}

function calculateRealProb(word) {
    calculateProbability(word.given);

    _.forEach(word.given, function(given) {
        given.realProb = given.prob * word.prob;
    });
}

function processData() {
    data = data.data.replace(/\W/g, ' ').normalize().toLowerCase().split(/\s+/g);
    var words = {};

    for (var i = 0; i < data.length; i++) {
        var value = data[i];
        var word;

        if (!_.has(words, value)) { 
            word = new Word({value: value});
            word.given = {};
            words[value] = word;
        } else {
            word = words[value];
        }

        if (i > 0) {
            var givenValue = data[i - 1];
            var given;

            if (!_.has(word.given, givenValue)) {
                given = { value: givenValue, freq: 0 };
                word.given[givenValue] = given;
            } else {
                given = word.given[givenValue];
            }

            given.freq++;
        }

        word.freq++;
    }

    calculateProbability(words);

    _.forEach(words, function(word) {
        word.given = _.toArray(word.given);
        calculateRealProb(word);
        word.save();
    });

}

function predict(current, before, cb) {
    current = current || '';
    if (before) {
        Word
            .where({'value': {'$regex': '^' + current }, 'given.value': before})
            .limit(15)
            .sort({'given.realProb': -1})
            .find(function(err, result) {
                if (err) { return console.error(err); }

                cb(result);
            });
    } else {
        Word
            .where({'value': {'$regex': '^' + current}})
            .limit(15)
            .sort({'prob': -1})
            .find(function(err, result) {
                if (err) { return console.error(err); }

                cb(result);
            });
    }
}

Word.remove({}, function(err) {
    if (err) { console.error(err); }

    processData();

});

module.exports = predict;
