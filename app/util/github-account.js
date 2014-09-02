'use strict';

var GithubRegex = /github\.com[\/:](.*?\/.*?)(\?|\/|\.git$)/i;

module.exports = function(info) {
    var repo  = (info.repository || {}).url,
        page  = info.homepage,
        bugs  = (info.bugs || {}).url,
        parts = [repo, page, bugs].filter(Boolean);

    var i = parts.length, matches;
    while (i--) {
        matches = parts[i].match(GithubRegex);
        if (matches[1]) {
            return matches[1];
        }
    }

    return false;
};