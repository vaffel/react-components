'use strict';

var config        = require('app/config'),
    request       = require('request'),
    JSONStream    = require('JSONStream'),
    eventStream   = require('event-stream'), 
    qs            = require('querystring'),
    ServerActions = require('app/actions/server');

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

exports.getModules = function(callback) {
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
        .pipe(JSONStream.parse('rows.*.key'))
        .pipe(eventStream.mapSync(parseModule))
        .pipe(eventStream.map(exports.getModuleInfo))
        .pipe(eventStream.writeArray(onComplete));
};

exports.getModuleDownloadCount = function(module, callback) {
    var url = [dlCountUrl, encodeURIComponent(module)].join('/');

    request({ url: url, json: true }, function(err, res, response) {
        callback(err, response);
    });
};

exports.getModuleInfo = function(module, callback) {
    var moduleName = module.name ? module.name : module,
        url = [registryUrl, moduleName].join('/');

    request({ url: url, json: true }, function(err, res, body) {
        callback(err, body);
    });
};

exports.listen = function() {
    ServerActions.getModulesFromNpm.shouldEmit = function() {
        return !isFetching;
    };

    ServerActions.getModulesFromNpm.listen(function() {
        exports.getModules(function(err, modules) {
            if (err) {
                return ServerActions.moduleFetchFailed(err);
            }
            
            ServerActions.modulesFetched(modules);
        });
    });
};