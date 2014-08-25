'use strict';

var request     = require('request'),
    JSONStream  = require('JSONStream'),
    eventStream = require('event-stream'), 
    qs          = require('querystring');

var registryUrl = 'https://registry.npmjs.org',
    viewsPath   = '-/_view',
    keywordView = 'byKeyword';

function parseModule(mod) {
    return {
        name: mod[1],
        description: mod[2]
    };
}

exports.getModulesForKeyword = function(keyword, callback) {
    var url = [registryUrl, viewsPath, keywordView].join('/') + '?' + qs.stringify({
        startkey: '["' + keyword + '"]',
        endkey: '["' + keyword + '",{}]',
        group_level: 3
    });

    request({ url: url })
        .pipe(JSONStream.parse('rows.*.key'))
        .pipe(eventStream.mapSync(parseModule))
        .pipe(eventStream.map(exports.getModuleInfo))
        .pipe(eventStream.writeArray(callback));
};

exports.getModuleInfo = function(module, callback) {
    var moduleName = module.name ? module.name : module,
        url = [registryUrl, moduleName].join('/');

    request({ url: url, json: true }, function(err, res, body) {
        callback(err, body);
    });
};