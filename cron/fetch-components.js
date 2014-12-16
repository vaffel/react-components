'use strict';

var NpmApi = require('app/api/npm-api');
var db = require('app/database');

NpmApi.getModules(function(err, modules) {
    if (err) {
        console.error('Module fetching failed: ', err);
        return;
    }

    modules.forEach(function(module) {
        db.setModule(module);
    });

    db.quit();
});