/** @jsx React.DOM */
'use strict';
var _ = require('lodash');
var React = require('react');
var marked = require('marked');
var config = require('app/config');
var escapeRegex = require('app/util/escape-regex');
var getGithubAccount = require('app/util/github-account');
var codeMirror = typeof window === 'undefined' ? function() {} : window.CodeMirror;

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
        // Apply CodeMirror to multi-line code elements
        var codeEls = this.getDOMNode().querySelectorAll('pre > code'), preEl, lang;
        for (var i = 0; i < codeEls.length; i++) {
            preEl = codeEls[i].parentNode;
            lang  = (codeEls[i].getAttribute('class') || '');
            lang  = lang.replace(/.*?lang\-(.*)/, '$1').split(/\s+/)[0];

            codeMirror(function(elt) {
                preEl.parentNode.replaceChild(elt, preEl);
            }, _.merge({
                value: codeEls[i].innerText.trim(),
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
                new RegExp('<a href="' + escapeRegex(matches[1]) + '">', 'g'),
                '<a href="' + githubUrl + file + '">'
            );
        }

        return html;
    },

    getGithubUrl: function() {
        var account = getGithubAccount(this.props.component);
        if (!account) {
            return false;
        }

        return 'https://github.com/' + account;
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