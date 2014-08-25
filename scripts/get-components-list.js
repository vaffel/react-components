'use strict';

var npmApi = require('app/npm-api');

npmApi.getModulesForKeyword('react-component', function(err, modules) {
    console.log(modules);
});