/** @jsx React.DOM */
'use strict';

var React = require('react');
var Reflux = require('reflux');
var Layout = require('app/components/layout.jsx');
var ComponentList = require('app/components/component-list.jsx');
var ComponentStore = require('app/stores/components-store');

function getStateFromStores() {
    return {
        recentlyCreated: ComponentStore.getMostRecentlyCreated(),
        recentlyUpdated: ComponentStore.getMostRecentlyUpdated()
    };
}

var FrontPage = React.createClass({
    displayName: 'FrontPage',

    mixins: [Reflux.ListenerMixin],

    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        this.listenTo(ComponentStore, this.onComponentsChanged);
    },

    onComponentsChanged: function() {
        this.setState(getStateFromStores);
    },

    /* jshint trailing:false, quotmark:false, newcap:false */
    render: function() {
        return (
            <Layout className="front" query={this.props.route.query}>
                <h1>Searchable database of <a href="http://facebook.github.io/react/">React</a> components</h1>
                <hr />

                <section className="component-lists">
                    <ComponentList
                        listName="Latest components"
                        className="latest-components"
                        components={this.state.recentlyCreated}
                    />

                    <ComponentList
                        listName="Recently updated"
                        className="modified-components"
                        components={this.state.recentlyUpdated}
                    />                    
                </section>
                
                <section className="faq">
                    <h2>How it works</h2>
                    <p>
                        Every module registered on <a href="https://www.npmjs.org/">NPM</a> using the keyword <a href="https://www.npmjs.org/browse/keyword/react-component" className="emphasize">react-component</a> will show up in the list.
                        It really is that simple.
                    </p>

                    <h2>How do I add my component to the list?</h2>
                    <ol>
                        <li>Ensure your <em className="emphasize">package.json</em> file contains an array of keywords which includes <em className="emphasize">react-component</em>.</li>
                        <li>Publish your component to NPM (learn how at <a href="https://www.npmjs.org/doc/cli/npm-publish.html">npmjs.org</a>).</li>
                        <li>Wait for it to show up! Shouldn't take longer than 10-15 minutes.</li>
                    </ol>

                    <h2>Missing any features?</h2>
                    <p><a href="https://github.com/vaffel/react-components/issues">Let us know</a>! We're always looking for ways to improve.</p>

                    <h2>Who made this? Can I contribute?</h2>
                    <p>
                        Developed and currently hosted by <a href="http://vaffel.ninja/">VaffelNinja</a>, but it's an open-source, MIT-licensed solution. 
                    </p>
                    <p>
                        Contributions are <a href="https://github.com/vaffel/react-components">very welcome</a>!
                        Please make sure you read the <a href="https://github.com/vaffel/react-components/blob/master/CONTRIBUTING.md">contribution guidelines</a>.
                    </p>
                </section>

            </Layout>
        );
    }
});

module.exports = FrontPage;