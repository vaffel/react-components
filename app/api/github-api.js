'use strict';

var config = require('app/config');
var Github = require('github');
var client = new Github({
    version: '3.0.0',
    protocol: 'https'
});

var getGithubAccount = require('app/util/github-account');

client.authenticate(config.github);

var GithubApi = {

    getStarCountForModule: function(module, callback) {
        var repo = getGithubAccount(module);

        if (!repo) {
            return callback('Repo not resolvable for module ' + module.name);
        }

        client.repos.get({
            user: repo.split('/', 1).join(''),
            repo: repo.replace(/.*?\//, '')
        }, function(err, data) {
            if (err) {
                return callback(err);
            }

            callback(err, (data || {}).stargazers_count || 0);
        });
    }

};

module.exports = GithubApi;
