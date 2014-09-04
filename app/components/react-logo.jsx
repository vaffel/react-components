'use strict';

var _ = require('lodash');
var React = require('react');

module.exports = React.createClass({
    displayName: 'ReactLogo',

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        var classNames = ['react-logo'].concat(this.props.className);

        return React.DOM.img(_.merge({}, this.props, {
            src: '/img/react.svg',
            alt: '',
            className: classNames.join(' ')
        }));
    }
});