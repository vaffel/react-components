/** @jsx React.DOM */
'use strict';

var React  = require('react');
var Reflux = require('reflux');
var config = require('app/config');
var Loader = require('app/components/loader.jsx');
var Layout = require('app/components/layout.jsx');
var MarkdownReadme = require('app/components/markdown-readme.jsx');
var ComponentStore = require('app/stores/components-store');
var getGithubAccount = require('app/util/github-account');
var numFormat = require('app/util/number-formatter');

function getStateFromStores(name) {
    return {
        componentInfo: ComponentStore.get(name),
        componentSummary: ComponentStore.getSummary(name)
    };
}

module.exports = React.createClass({
    displayName: 'ComponentInfo',

    mixins: [Reflux.ListenerMixin],

    getInitialState: function() {
        return getStateFromStores(this.props.route.componentName);
    },

    componentDidMount: function() {
        this.listenTo(ComponentStore, this.onComponentInfoChanged);
    },

    onComponentInfoChanged: function() {
        this.setState(getStateFromStores(this.props.route.componentName));

        window.document.title = this.getPageTitle();
    },

    getPageTitle: function() {
        var componentName = this.props.route.componentName;
        return componentName + ' - ' + config['page-title'];
    },

    getGithubUrl: function() {
        var account = getGithubAccount(this.state.componentInfo);
        if (!account) {
            return false;
        }

        return 'https://github.com/' + account;
    },

    /* jshint quotmark:false, newcap:false */
    getHomepageButton: function() {
        var githubUrl = this.getGithubUrl();
        var homePageUrl = this.state.componentInfo.homepage || '';

        if (homePageUrl.match(/https?:\/\//i) && githubUrl !== homePageUrl) {
            return (
                <a href={homePageUrl} className="pure-button">
                    <i className="fa fa-globe" /> Homepage
                </a>
            );
        }

        return null;
    },

    /* jshint quotmark:false, newcap:false */
    getGithubButton: function() {
        var githubUrl = this.getGithubUrl();
        if (!githubUrl) {
            return null;
        }
        
        return (
            <a href={githubUrl} className="pure-button" target="_blank">
                <i className="fa fa-github" /> GitHub
            </a>
        );
    },

    /* jshint quotmark:false, newcap:false */
    getGithubStarsButton: function() {
        var githubUrl = this.getGithubUrl();

        if (!githubUrl) {
            return null;
        }

        return (
            <a title="Number of stars on Github" href={githubUrl + '/stargazers'} className="pure-button">
                <i className="fa fa-star" /> { numFormat(this.state.componentSummary.stars || 0) }
            </a>
        );
    },

    /* jshint quotmark:false, newcap:false */
    getDownloadsButton: function() {
        return (
            <a title="Downloads last week" href={"https://www.npmjs.org/package/" + this.state.componentInfo.name} className="pure-button">
                <i className="fa fa-arrow-circle-o-down" /> { numFormat(this.state.componentSummary.downloads || 0) }
            </a>
        );
    },

    /* jshint quotmark:false, newcap:false */
    render: function() {
        return (
            <Layout className="component-info" query={this.props.route.componentName} autoFocusSearch={false}>
                {
                    this.state.componentInfo ? 
                    <div>
                        <aside>
                        <div className="toolbar">
                            {this.getGithubButton()}
                            {this.getHomepageButton()}
                            {this.getGithubStarsButton()}
                            {this.getDownloadsButton()}
                        </div>
                        </aside>
                        <MarkdownReadme component={this.state.componentInfo} />
                    </div> :
                    <Loader />
                }
            </Layout>
        );
    }
});