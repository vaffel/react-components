'use strict';

var fs     = require('fs');
var config = require('app/config');
var async  = require('async');
var Github = require('github');
var LRU    = require('lru-cache');
var client = new Github({
    version: '3.0.0',
    protocol: 'https'
});

var getGithubAccount = require('app/util/github-account');
var ServerActions = require('app/actions/server');
var ComponentStore = require('app/stores/components-store');
var cache  = new LRU({
    max: 10000,
    maxAge: 1000 * 60 * 60
});

client.authenticate(config.github);

var GithubApi = {

    getStarCountForModule: function(module, callback) {
        var moduleName = module.name,
            starCount  = cache.get(moduleName),
            repo       = getGithubAccount(module);

        if (typeof starCount !== 'undefined') {
            return setImmediate(callback, null, starCount);
        } else if (!repo) {
            return setImmediate(callback, null, 0);
        }

        client.repos.get({
            user: repo.split('/', 1).join(''),
            repo: repo.replace(/.*?\//, '')
        }, function(err, data) {
            if (err) {
                return callback(err);
            }

            starCount = {
                moduleName: moduleName,
                starCount: (data || {}).stargazers_count || 0
            };

            cache.set(moduleName, starCount);
            callback(err, starCount);
        });
    },

    populateModuleStarCount: function(module, callback) {
        GithubApi.getStarCountForModule(module, function(err, info) {
            if (err) {
                return callback(err, module);
            }

            module.starCount = info.starCount;
            callback(err, module);
        });
    },

    getStarCountForModules: function(modules, callback) {
        async.map(modules, GithubApi.getStarCountForModule, callback);
    },

    writeStarCountCache: function(counts, callback) {
        fs.writeFile(
            config.cache.starCounts,
            JSON.stringify(counts, null, 4),
            callback || function() {}
        );
    },

    readStarCountCache: function(callback) {
        fs.readFile(config.cache.starCounts, { encoding: 'utf8' },  function(err, file) {
            callback(err, file ? JSON.parse(file) : null);
        });
    },

    initStarCountCache: function(callback) {
        GithubApi.readStarCountCache(function(err, starCounts) {
            if (err && err.code !== 'ENOENT') {
                return callback(err);
            } else if (err) {
                return callback();
            }

            (starCounts || []).forEach(function(item) {
                cache.set(item.moduleName, {
                    moduleName: item.moduleName,
                    starCount: item.starCount
                });
            });

            callback(err, starCounts);
        });
    },

    listen: function() {
        var initialFetch = true;
        ServerActions.modulesFetched.listen(function() {
            if (!initialFetch) {
                return;
            }

            GithubApi.getStarCountForModules(ComponentStore.getSummaries(), function(err, views) {
                if (!err) {
                    GithubApi.writeStarCountCache(views);
                }
            });

            initialFetch = false;
        });
    }

};

module.exports = GithubApi;
