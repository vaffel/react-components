'use strict';

var Front = require('app/pages/front');

module.exports = {
    '/': Front,
    '/search/:query': Front
};