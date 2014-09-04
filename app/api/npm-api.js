'use strict';

var config        = require('app/config'),
    request       = require('request'),
    JSONStream    = require('JSONStream'),
    eventStream   = require('event-stream'),
    qs            = require('querystring'),
    ServerActions = require('app/actions/server'),
    GithubApi     = require('app/api/github-api');

var registryUrl   = 'https://registry.npmjs.org',
    viewsPath     = '-/_view',
    keywordView   = 'byKeyword',
    keyword       = config['npm-keyword'],
    dlCountUrl    = 'https://api.npmjs.org/downloads/point/last-week',
    isFetching    = false;

function parseModule(mod) {
    return {
        name: mod[1],
        description: mod[2]
    };
}

var NpmApi = {

    getModules: function(callback) {
        var url = [registryUrl, viewsPath, keywordView].join('/') + '?' + qs.stringify({
            startkey: '["' + keyword + '"]',
            endkey: '["' + keyword + '",{}]',
            group_level: 3
        });

        var onComplete = function(err, modules) {
            isFetching = false;
            callback(err, modules);
        };

        isFetching = true;
        request({ url: url })
            .on('error', function(err) { console.error('Error fetching modules: ', err); })
            .pipe(JSONStream.parse('rows.*.key'))
            .pipe(eventStream.mapSync(parseModule))
            .pipe(eventStream.map(NpmApi.getModuleInfo))
            .on('error', function(err) { console.error('Error fetching module info: ', err); })
            .pipe(eventStream.map(NpmApi.getModuleDownloadCount))
            .on('error', function(err) { console.error('Error fetching module download count: ', err); })
            .pipe(eventStream.map(GithubApi.populateModuleStarCount))
            .on('error', function(err) { console.error('Error fetching github star counts: ', err); })
            .pipe(eventStream.writeArray(onComplete));
    },

    getModuleDownloadCount: function(module, callback) {
        var moduleName = module.name ? module.name : module,
            url = [dlCountUrl, encodeURIComponent(moduleName)].join('/');

        request({ url: url, json: true }, function(err, res, response) {
            module.downloads = (response || {}).downloads;
            callback(err, module);
        });
    },

    getModuleInfo: function(module, callback) {
        var moduleName = module.name ? module.name : module,
            url = [registryUrl, moduleName].join('/');

        request({ url: url, json: true }, function(err, res, body) {
            callback(err, body);
        });
    },

    listen: function() {
        ServerActions.getModulesFromNpm.shouldEmit = function() {
            return !isFetching;
        };

        ServerActions.getModulesFromNpm.listen(function() {
            NpmApi.getModules(function(err, modules) {
                if (err) {
                    return ServerActions.moduleFetchFailed(err);
                }

                ServerActions.modulesFetched(modules);
            });
        });
    }
};

module.exports = NpmApi;
