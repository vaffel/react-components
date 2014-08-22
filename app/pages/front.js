/** @jsx React.DOM */
'use strict';

var React = require('react');
var Container = require('app/components/container');
var ReactLogo = require('app/components/react-logo');
var SearchInput = require('app/components/search-input');

var FrontPage = React.createClass({
    displayName: 'FrontPage',

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return (
            <div>
                <header>
                    <Container>
                        <ReactLogo />
                        <h1>React Components</h1>

                        <SearchInput />
                    </Container>
                </header>

                <main>
                    <Container>
                        Content!
                    </Container>
                </main>
            </div>
        );
    }
});

module.exports = FrontPage;