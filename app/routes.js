'use strict';

var Front  = require('app/pages/front.jsx');
var Search = require('app/pages/search.jsx');
var ComponentInfo = require('app/pages/component-info.jsx');

module.exports = {
    '/': Front,
    '/search/:query': Search,
    '/component/:componentName': ComponentInfo
};