/** @jsx React.DOM */
'use strict';

var React = require('react');
var Container = require('app/components/container.jsx');
var ReactLogo = require('app/components/react-logo.jsx');
var SearchInput = require('app/components/search-input.jsx');
var Loader = require('app/components/loader.jsx');
var Footer = require('app/components/footer.jsx');

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

                        <SearchInput query="" />
                    </Container>
                </header>

                <main>
                    <Container className="front">
                        <h1>Searchable database of <a href="http://facebook.github.io/react/">React</a> components</h1>
                        <hr />

                        <h2>How it works</h2>
                        <p>
                            Every module registered on <a href="https://www.npmjs.org/">NPM</a> using the keyword <a href="https://www.npmjs.org/browse/keyword/react-component" className="emphasize">react-component</a> will show up in the list.
                            It really is that simple.
                        </p>

                        <h2>How do I add my React component to the list?</h2>
                        <ol>
                            <li>Ensure your <em className="emphasize">package.json</em> file contains an array of keywords which includes <em className="emphasize">react-component</em>.</li>
                            <li>Publish your component to NPM (info on how to do that here).</li>
                            <li>Wait for it to show up! Shouldn't take longer than 10-15 minutes.</li>
                        </ol>

                        <h2>Who made this? Can I contribute?</h2>
                        <p>
                            Developed and currently hosted by <a href="http://vaffel.ninja/">VaffelNinja</a>, but it's an open-source, MIT-licensed solution. 
                        </p>
                        <p>
                            Contributions are <a href="https://github.com/vaffel/react-components">very welcome</a>!
                            Please make sure you read the <a href="https://github.com/vaffel/react-components/blob/master/CONTRIBUTING.md">contribution guidelines</a>.
                        </p>

                    </Container>
                </main>

                <Footer />
            </div>
        );
    }
});

module.exports = FrontPage;