'use strict';

var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'fetchComponents',
    'fetchFailed',
    'componentsFetched',

    'fetchComponentInfo',
    'fetchComponentFailed',
    'componentFetched'
]);