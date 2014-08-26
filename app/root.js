/** @jsx React.DOM */
'use strict';

var _ = require('lodash');
var React = require('react/addons');
var router = require('app/router');
var isBrowser = typeof window !== 'undefined';

router.setRoutes(require('app/routes'));

var App = React.createClass({
    displayName: 'App',

    propTypes: {
        path: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
        return {
            path: false
        };
    },

    componentDidMount: function() {
        window.addEventListener('popstate', this.onLocationChanged, false);

        router.on('location-change', this.onLocationChanged);
    },

    componentWillUnmount: function() {
        window.removeEventListener('popstate', this.onLocationChanged, false);

        router.removeListener('location-change', this.onLocationChanged);
    },

    onLocationChanged: function() {
        this.setState({ path: window.location.pathname + window.location.search });
    },

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        var match = router.match(this.state.path || this.props.path);

        if (!match) {
            console.error('Could not match URL (' + this.props.path + ')');
            return null;
        }

        return new match.page(_.merge({}, this.state, {
            query: match.query || {},
            route: match.route || {},
        }));
    }
});

if (isBrowser) {
    React.renderComponent(new App({
        path: window.location.pathname + window.location.search
    }), document.getElementById('root'));
}

module.exports = App;