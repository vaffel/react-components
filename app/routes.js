'use strict';

var Front  = require('app/pages/front.jsx');
var Search = require('app/pages/search.jsx');

module.exports = {
    '/': Front,
    '/search/:query': Search
};