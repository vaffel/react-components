'use strict';

var NpmApi   = require('app/api/npm-api');
var sublevel = require('level-sublevel');
var level    = require('level');
var config   = require('app/config');

var db = sublevel(level(config.leveldb.location, {
    valueEncoding: 'json'
}));

var componentDb = db.sublevel('components');

NpmApi.getModules(function(err, modules) {
    if (err) {
        return console.error(err);
    }

    var ops = modules.map(function(mod) {
        return {
            type: 'put',
            key: mod._id,
            value: mod
        };
    });

    componentDb.batch(ops, function(err) {
        if (err) {
            console.error(err);
        }
    });
});
