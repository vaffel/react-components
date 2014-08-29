'use strict';
 
function deep(obj, prop) {
    var segs = prop.split('.');
    while (segs.length) {
        obj = obj[segs.shift()];
    }
    return obj;
}
 
module.exports = function(prop) {
    return function(item) {
        return deep(item, prop);
    };
};