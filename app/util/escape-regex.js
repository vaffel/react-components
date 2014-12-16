'use strict';

module.exports = function escapeRegExp(str) {
    return ('' + str).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
};