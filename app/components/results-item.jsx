/** @jsx React.DOM */
'use strict';

var React = require('react');
var ComponentLink = require('app/components/component-link.jsx');

module.exports = React.createClass({
    displayName: 'SearchResultItem',

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <tr>
                <td>
                    <ComponentLink component={this.props.component} />
                    <p className="description">{this.props.component.description}</p>

                    <dl className="component-meta">
                        <dt><i className="fa fa-star-o" title="Stars" /></dt>
                        <dd>{this.props.component.stars || 0}</dd>

                        <dt><i className="fa fa-calendar" title="Modified" /></dt>
                        <dd>{this.props.component.modified.fromNow()}</dd>

                        <dt><i className="fa fa-user" title="Author" /></dt>
                        <dd>{this.props.component.author}</dd>
                    </dl>
                </td>
                <td>{this.props.component.author}</td>
                <td>{this.props.component.stars || 0}</td>
                <td>{this.props.component.modified.fromNow()}</td>
            </tr>
        );
    }
});