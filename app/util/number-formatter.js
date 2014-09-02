'use strict';

var sepThousands = /\B(?=(?:\d{3})+(?!\d))/g;

module.exports = function(num) {
    if (num < 1000) {
        return num;
    }

    if (num < 10000) {
        return (num + '').replace(sepThousands, ' ');
    }

    if (num < 1000000) {
        return Math.floor(num / 1000) + 'K';
    }

    return (num / 1000000).toFixed(1) + 'M';
};