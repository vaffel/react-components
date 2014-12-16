'use strict';

var config = require('app/config');
var redis  = require('redis');
var async  = require('async');
var client;

function getDb() {
    if (client) {
        return client;
    }

    client = redis.createClient();
    client.select(config.redis.databaseNumber);

    client.on('error', function(err) {
        console.error('Redis error: ', err);
    });

    return client;
}

function getModuleNames(callback) {
    getDb().smembers('module:list', callback);
}

function getModule(name, callback) {
    getDb().get('module:info:' + name, function(err, data) {
        callback(err, err ? null : jsonParse(data));
    });
}

function getModules(callback) {
    getModuleNames(function(err, names) {
        if (err) {
            return callback(err);
        }

        async.map(names, getModule, callback);
    });
}

function setModule(module, callback) {
    var client = getDb();

    async.series([
        async.apply(client.set.bind(client), 'module:info:' + module._id, JSON.stringify(module)),
        async.apply(client.sadd.bind(client), 'module:list', module._id)
    ], callback);
}

function setModuleStars(name, stars, callback) {
    getDb().set('module:stars:' + name, stars, callback);
}

function unref() {
    if (client) {
        client.unref();
    }
}

function quit() {
    if (client) {
        client.quit();
    }
}

function jsonParse(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

module.exports = {
    getModuleNames: getModuleNames,
    getModules: getModules,
    getModule: getModule,

    setModule: setModule,
    setModuleStars: setModuleStars,

    unref: unref,
    quit: quit
};