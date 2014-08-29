'use strict';

var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'initializeComponentStore',
    'getModulesFromNpm',
    'moduleFetchFailed',
    'modulesFetched',
    'getModuleDownloadCount'
]);