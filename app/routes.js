'use strict';

var Front = require('app/pages/front.jsx');

module.exports = {
    '/': Front,
    '/search/:query': Front
};