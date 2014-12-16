'use strict';

var db = require('app/database');
var async = require('async');
var GithubApi = require('app/api/github-api');

db.getModules(function(err, modules) {
    if (err) {
        console.error('Failed to fetch modules from DB: ', err);
        db.quit();
        return;
    }

    async.map(modules, getStarCountAndUpdate, function(err) {
        db.quit();

        if (err) {
            console.error('Failed to update DB: ', err);
        }
    });
});

function getStarCountAndUpdate(module, callback) {
    GithubApi.getStarCountForModule(module, function(err, starCount) {
        if (err) {
            return callback();
        }

        db.setModuleStars(module._id, starCount, callback);
    });
}