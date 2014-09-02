/** @jsx React.DOM */
'use strict';

// Hey, if Facebook/Instagram can do it, so can I ;-)
var IS_BROWSER = typeof window !== 'undefined';
var IS_MOBILE  = (IS_BROWSER && (
    navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
));

var _ = require('lodash');
var React = require('react');
var marked = require('marked');
var config = require('app/config');
var CodeMirror = typeof window === 'undefined' ? function() {} : window.CodeMirror;
var GithubRegex = /github\.com[\/:](.*?\/.*?)(\?|\/|\.git$)/i;

var mirrorOptions = {
    lineNumbers: false,
    lineWrapping: true,
    smartIndent: false,
    matchBrackets: true,
    theme: 'solarized-light',
    readOnly: true
};

module.exports = React.createClass({
    displayName: 'MarkdownReadme',

    componentDidMount: function() {
        if (IS_MOBILE) {
            return;
        }

        // Apply CodeMirror to multi-line code elements
        var codeEls = this.getDOMNode().querySelectorAll('pre > code'), preEl, lang;
        for (var i = 0; i < codeEls.length; i++) {
            preEl = codeEls[i].parentNode;
            lang  = (codeEls[i].getAttribute('class') || '');
            lang  = lang.replace(/.*?lang\-(.*)/, '$1').split(/\s+/)[0];

            CodeMirror(function(elt) {
                preEl.parentNode.replaceChild(elt, preEl);
            }, _.merge({
                value: codeEls[i].innerText,
                mode: config['codemirror-modes'][lang] || 'javascript'
            }, mirrorOptions));
        }
    },

    fixRelativeUrls: function(html) {
        var branch = '/blob/' + this.props.component.branch;
        var githubUrl = this.getGithubUrl() + branch, matches;
        var matcher = /<a href="(.*?)"/g, file;

        while (matches = matcher.exec(html)) {
            file = matches[1];
            if (file.match(/^https?:\/\//)) {
                continue;
            }

            file = file.indexOf('/') === 0 ? file : ('/' + file);
            html = html.replace(
                new RegExp('<a href="' + matches[1] + '">', 'g'),
                '<a href="' + githubUrl + file + '">'
            );
        }

        return html;
    },

    getGithubUrl: function() {
        var account = this.getGithubAccount();
        if (!account) {
            return false;
        }

        return 'https://github.com/' + account;
    },

    getGithubAccount: function() {
        var info  = this.props.component,
            repo  = (info.repository || {}).url,
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
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        var html = this.fixRelativeUrls(marked(this.props.component.readme));
        return (
            <section
                className="readme"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }
});