'use strict';

var GithubApi = require('app/api/github-api');
var sublevel  = require('level-sublevel');
var level     = require('level');
var config    = require('app/config');

var db = sublevel(level(config.leveldb.location, {
    valueEncoding: 'json'
}));

var starsDb = db.sublevel('stars');
var componentsDb = db.sublevel('components');

componentsDb.createReadStream()
    .on('data', function(row) {
        GithubApi.getStarCountForModule(row.value, function(err, starCount) {
            if (err) {
                return;
            }
            
            starsDb.put(row.key, starCount);
        });
    });
