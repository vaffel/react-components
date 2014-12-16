/** @jsx React.DOM */
'use strict';

var _ = require('lodash');
var React = require('react/addons');
var Reflux = require('reflux');
var router = require('app/router');
var isBrowser = typeof window !== 'undefined';

var RoutingActions = require('app/actions/routing');
var ComponentStore = require('app/stores/components-store');
var ComponentApi   = require('app/api/components-api');
var SearchIndex    = require('app/search/filter');

// We'll want to use react-router when server-side rendering is ready
router.setRoutes(require('app/routes'));

var App = React.createClass({
    displayName: 'App',

    mixins: [Reflux.ListenerMixin],

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

        this.listenTo(RoutingActions.locationChange, this.onLocationChanged);
    },

    componentWillUnmount: function() {
        window.removeEventListener('popstate', this.onLocationChanged, false);
    },

    onLocationChanged: function() {
        this.setState({ path: window.location.pathname + window.location.search });
    },

    render: function() {
        var match = router.match(this.state.path || this.props.path);

        if (!match) {
            console.error('Could not match URL (' + this.props.path + ')');
            return null; // @todo render error-view?
        }

        return new match.page(_.merge({}, this.state, {
            query: match.query || {},
            route: match.route || {}
        }));
    }
});

// Have the API and search index listen for dispatcher events
ComponentApi.listen();
SearchIndex.listen();

if (isBrowser) {
    // Allow React to leak into global namespace - enables devtools etc
    window.React = React;

    // Wait for components list to be ready
    ComponentStore.listen(function() {
        // Render the app once the components list is ready
        // (Normally, we'd just show a "loading"-state, but since
        // we're rendering on server side...)
        React.renderComponent(new App({
            path: window.location.pathname + window.location.search
        }), document.getElementById('root'));
    });
}

// Prime component store
ComponentStore.populateFromDatabase();

// Have component store fetch new components every once in a while
setInterval(
    ComponentStore.populateFromDatabase.bind(ComponentStore),
    isBrowser ? 1000 * 60 * 15 : 1000 * 60 * 5 // 15 minutes in browser, 5 on server
);

module.exports = App;