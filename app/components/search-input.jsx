/** @jsx React.DOM */
'use strict';

var React  = require('react');
var config = require('app/config');
var router = require('app/router');

module.exports = React.createClass({
    displayName: 'SearchInput',

    propTypes: {
        autoFocus: React.PropTypes.bool,
        placeholder: React.PropTypes.string,
        query: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            autoFocus: true,
            placeholder: 'Component name, keyword or similar',
            query: ''
        };
    },

    getInitialState: function() {
        return {
            query: this.props.query
        };
    },

    componentDidMount: function() {
        // Use to bring up the "looking glass"-icon
        this.getDOMNode().setAttribute('results', 5);

        // Focus the END of the input (if it has a value and autofocus is set to true)
        if (this.props.query && this.props.autoFocus) {
            this.moveCaretToEnd();
        }
    },

    getPageTitle: function(query) {
        return (query ? (query + ' - ') : '') + config['page-title'];
    },

    moveCaretToEnd: function() {
        var el = this.getDOMNode();
        if (typeof el.selectionStart === 'number') {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange !== 'undefined') {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    },

    onQueryChange: function(e) {
        var state = { query: e.target.value },
            url   = state.query ? '/search/' + encodeURIComponent(state.query) : '/',
            title = this.getPageTitle(state.query);

        if (this.state.query) {
            history.replaceState(state, title, url);
        } else {
            history.pushState(state, title, url);
        }

        router.locationChanged();

        window.document.title = title;
        this.setState(state);
    },

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return (
            <input
                type="search"
                className="search"
                onChange={this.onQueryChange}
                defaultValue={this.props.query}
                value={this.state.query}
                placeholder={this.props.placeholder}
                autoFocus={this.props.autoFocus}
            />
        );
    }
});