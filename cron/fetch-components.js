'use strict';

var _ = require('lodash');
var NpmApi = require('app/api/npm-api');
var db = require('app/database');

NpmApi.getModules(function(err, modules) {
    if (err) {
        console.error('Module fetching failed: ', err);
        return;
    }

    var done = _.after(modules.length, function() {
        db.quit();
    });

    modules.forEach(function(module) {
        db.setModule(module, done);
    });
});