webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var _ = __webpack_require__(1);
	var React = __webpack_require__(3);
	var Reflux = __webpack_require__(163);
	var router = __webpack_require__(170);
	var isBrowser = typeof window !== 'undefined';
	
	var RoutingActions = __webpack_require__(171);
	var ComponentStore = __webpack_require__(172);
	var ComponentApi   = __webpack_require__(175);
	var ApiActions     = __webpack_require__(174);
	var SearchIndex    = __webpack_require__(183);
	
	// We'll want to use react-router when server-side rendering is ready
	router.setRoutes(__webpack_require__(185));
	
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
	
	    // Fetch components from API
	    ApiActions.fetchComponents();
	
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
	
	
	module.exports = App;

/***/ },

/***/ 170:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
	var RoutingActions = __webpack_require__(171);
	var map = {};
	
	var Router = {
	    setRoutes: function(routeMap) {
	        map = routeMap;
	    },
	
	    match: function(url) {
	        var parts = url.split('?'),
	            qs    = parts[1] || '',
	            path  = parts[0],
	            query = {},
	            pattern, params;
	
	        qs.replace(queryParser, function ($0, $1, $2) {
	            if ($1) {
	                query[$1] = $2;
	            }
	        });
	
	        for (pattern in map) {
	            params = matchPattern(pattern, path);
	
	            if (params) {
	                return {
	                    route: params,
	                    query: query,
	                    page : map[pattern]
	                };
	            }
	        }
	
	        return null;
	    },
	
	    locationChanged: function() {
	        RoutingActions.locationChange();
	    }
	};
	
	module.exports = Router;
	
	function matchPattern(pattern, url) {
	    var vars = pattern.match(/(:[a-zA-Z0-9]+)/g),
	        re = new RegExp('^' + pattern.replace(/(:[a-zA-Z0-9]+)/g, '(.*?)') + '$'),
	        matches = url.match(re),
	        params = {},
	        varname;
	
	    if (!matches) {
	        return null;
	    }
	
	    for (var i = 1; i < matches.length; i++) {
	        varname = vars[i - 1].substring(1);
	        params[varname] = decodeURIComponent(matches[i]);
	    }
	
	    return params;
	}

/***/ },

/***/ 171:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Reflux = __webpack_require__(163);
	
	module.exports = Reflux.createActions([
	    'locationChange'
	]);

/***/ },

/***/ 172:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var moment = __webpack_require__(173);
	var Reflux = __webpack_require__(163);
	var ApiActions = __webpack_require__(174);
	
	var ComponentStore = Reflux.createStore({
	    init: function() {
	        this.components = {};
	        this.componentSummaries = [];
	
	        this.listenTo(ApiActions.componentsFetched, this.populate);
	        this.listenTo(ApiActions.componentFetched, this.addComponentInfo);
	    },
	
	    get: function(name) {
	        if (this.components[name]) {
	            return this.components[name];
	        }
	
	        ApiActions.fetchComponentInfo(name);
	    },
	
	    getAll: function() {
	        return this.components;
	    },
	
	    getSummaries: function() {
	        return this.componentSummaries;
	    },
	
	    getMostRecentlyCreated: function(limit) {
	        return (
	            _.sortBy(this.componentSummaries, 'created')
	            .reverse()
	            .slice(0, limit || 10)
	        );
	    },
	
	    getMostRecentlyUpdated: function(limit) {
	        var mostRecent  = this.getMostRecentlyCreated();
	        var lastUpdated = _.sortBy(this.componentSummaries, 'modified').reverse();
	
	        return _.without.apply(null, [lastUpdated].concat(mostRecent)).slice(0, limit || 10);
	    },
	
	    populate: function(components) {
	        components.map(this.addComponent);
	        this.trigger('change');
	    },
	
	    parseComponent: function(component) {
	        component.modified = moment.utc(component.modified);
	        component.created  = moment.utc(component.created);
	
	        return component;
	    },
	
	    addComponent: function(component) {
	        component = this.parseComponent(component);
	        
	        this.componentSummaries.push(component);
	    },
	
	    addComponentInfo: function(component) {
	        this.components[component.name] = component;
	        this.trigger('change');
	    }
	});
	
	module.exports = _.bindAll(ComponentStore);

/***/ },

/***/ 174:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Reflux = __webpack_require__(163);
	
	module.exports = Reflux.createActions([
	    'fetchComponents',
	    'fetchFailed',
	    'componentsFetched',
	
	    'fetchComponentInfo',
	    'fetchComponentFailed',
	    'componentFetched'
	]);

/***/ },

/***/ 175:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _  = __webpack_require__(1);
	var Reflux = __webpack_require__(163);
	var ApiActions = __webpack_require__(174);
	var request = __webpack_require__(176);
	var isFetchingList = false;
	
	var ComponentsApi = {
	    fetchComponents: function() {
	        isFetchingList = true;
	
	        request({ url: '/api/components', json: true }, function(err, xhr, body) {
	            if (err) {
	                return ApiActions.fetchFailed(err);
	            }
	
	            var assignKey  = _.partial(_.zipObject, body.keys),
	                components = _.map(body.items, assignKey);
	
	            isFetchingList = false;
	            ApiActions.componentsFetched(components);
	        });
	    },
	
	    fetchComponentInfo: function(name) {
	        request({ url: '/api/components/' + encodeURIComponent(name), json: true }, function(err, xhr, body) {
	            if (err) {
	                return ApiActions.fetchComponentFailed(err);
	            }
	
	            ApiActions.componentFetched(body);
	        });
	    },
	
	    listen: function() {
	        ApiActions.fetchComponents.shouldEmit = function() {
	            return !isFetchingList;
	        };
	
	        ApiActions.fetchComponents.listen(ComponentsApi.fetchComponents);
	        ApiActions.fetchComponentInfo.listen(ComponentsApi.fetchComponentInfo);
	    }
	};
	
	module.exports = ComponentsApi;

/***/ },

/***/ 183:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(1);
	var lunr = __webpack_require__(184);
	var ComponentStore = __webpack_require__(172);
	var index = getNewIndex();
	
	function getNewIndex() {
	    return lunr(function() {
	        this.field('name', { boost: 10 });
	        this.field('keywords', { boost: 5 });
	        this.field('description');
	    });
	}
	
	var SearchFilter = {
	    listen: function() {
	        ComponentStore.listen(this.onComponentsChanged);
	    },
	
	    onComponentsChanged: function() {
	        var components = ComponentStore.getSummaries();
	
	        // Reset search index
	        index = getNewIndex();
	
	        // Add components
	        components.map(this.indexComponent);
	    },
	
	    indexComponent: function(mod, id) {
	        index.add({
	            id: id,
	            name: mod.name,
	            keywords: mod.keywords.join(' '),
	            description: mod.description
	        });
	    },
	
	    filter: function(query) {
	        var summaries = ComponentStore.getSummaries();
	        return index.search(query).map(function(match) {
	            return _.merge(summaries[match.ref], match);
	        });
	    }
	};
	
	module.exports = _.bindAll(SearchFilter);

/***/ },

/***/ 185:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Front  = __webpack_require__(186);
	var Search = __webpack_require__(197);
	var ComponentInfo = __webpack_require__(201);
	
	module.exports = {
	    '/': Front,
	    '/search/:query': Search,
	    '/component/:componentName': ComponentInfo 
	};

/***/ },

/***/ 186:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var Reflux = __webpack_require__(163);
	var Layout = __webpack_require__(188);
	var ComponentList = __webpack_require__(194);
	var ComponentStore = __webpack_require__(172);
	
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
	            Layout({className: "front", query: this.props.route.query}, 
	                React.DOM.h1(null, "Searchable database of ", React.DOM.a({href: "http://facebook.github.io/react/"}, "React"), " components"), 
	                React.DOM.hr(null), 
	                
	                React.DOM.section({className: "faq"}, 
	                    React.DOM.h2(null, "How it works"), 
	                    React.DOM.p(null, 
	                        "Every module registered on ", React.DOM.a({href: "https://www.npmjs.org/"}, "NPM"), " using the keyword ", React.DOM.a({href: "https://www.npmjs.org/browse/keyword/react-component", className: "emphasize"}, "react-component"), " will show up in the list." + ' ' +
	                        "It really is that simple."
	                    ), 
	
	                    React.DOM.h2(null, "How do I add my component to the list?"), 
	                    React.DOM.ol(null, 
	                        React.DOM.li(null, "Ensure your ", React.DOM.em({className: "emphasize"}, "package.json"), " file contains an array of keywords which includes ", React.DOM.em({className: "emphasize"}, "react-component"), "."), 
	                        React.DOM.li(null, "Publish your component to NPM (learn how at ", React.DOM.a({href: "https://www.npmjs.org/doc/cli/npm-publish.html"}, "npmjs.org"), ")."), 
	                        React.DOM.li(null, "Wait for it to show up! Shouldn't take longer than 10-15 minutes.")
	                    ), 
	
	                    React.DOM.h2(null, "Missing any features?"), 
	                    React.DOM.p(null, React.DOM.a({href: "https://github.com/vaffel/react-components/issues"}, "Let us know"), "! We're always looking for ways to improve."), 
	
	                    React.DOM.h2(null, "Who made this? Can I contribute?"), 
	                    React.DOM.p(null, 
	                        "Developed and currently hosted by ", React.DOM.a({href: "http://vaffel.ninja/"}, "VaffelNinja"), ", but it's an open-source, MIT-licensed solution." 
	                    ), 
	                    React.DOM.p(null, 
	                        "Contributions are ", React.DOM.a({href: "https://github.com/vaffel/react-components"}, "very welcome"), "!" + ' ' +
	                        "Please make sure you read the ", React.DOM.a({href: "https://github.com/vaffel/react-components/blob/master/CONTRIBUTING.md"}, "contribution guidelines"), "."
	                    )
	                ), 
	
	                React.DOM.section({className: "component-lists"}, 
	                    ComponentList({
	                        listName: "Latest components", 
	                        className: "latest-components", 
	                        components: this.state.recentlyCreated}
	                    ), 
	
	                    ComponentList({
	                        listName: "Recently updated", 
	                        className: "modified-components", 
	                        components: this.state.recentlyUpdated}
	                    )
	                )
	
	            )
	        );
	    }
	});
	
	module.exports = FrontPage;

/***/ },

/***/ 187:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);


/***/ },

/***/ 188:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var config = __webpack_require__(189);
	var Footer = __webpack_require__(190);
	var Container = __webpack_require__(191);
	var ReactLogo = __webpack_require__(192);
	var SearchInput = __webpack_require__(193);
	
	module.exports = React.createClass({
	    displayName: 'Layout',
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.div(null, 
	                React.DOM.header(null, 
	                    Container(null, 
	                        ReactLogo(null), 
	                        React.DOM.h1(null, React.DOM.a({href: "/"}, config['page-title'])), 
	
	                        SearchInput({query: this.props.query || '', autoFocus: this.props.autoFocusSearch})
	                    )
	                ), 
	
	                React.DOM.main(null, 
	                    Container({className: this.props.className || ''}, 
	                        this.props.children
	                    )
	                ), 
	
	                Footer(null)
	            )
	        );
	    }
	});

/***/ },

/***/ 189:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    'page-title': 'React Components',
	    'npm-keyword': 'react-component',
	    'poll-interval': 300000,
	    'exclude-keywords': ['react', 'react-component'],
	    'codemirror-modes': {
	        'cs': 'coffeescript',
	        'coffeescript': 'coffeescript',
	        'coffee': 'coffeescript',
	        'css': 'css',
	        'html': 'htmlmixed',
	        'javascript': 'javscript',
	        'js': 'javascript',
	        'php': 'php',
	        'ruby': 'ruby',
	        'rb': 'rb',
	        'shell': 'shell',
	        'sh': 'shell',
	        'bash': 'shell',
	        'batch': 'shell',
	        'yaml': 'yaml'
	    }
	};

/***/ },

/***/ 190:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	
	module.exports = React.createClass({
	    displayName: 'Footer',
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.footer(null, 
	                "Made by ", React.DOM.a({href: "http://vaffel.ninja/"}, "VaffelNinja AS"), ". ", React.DOM.a({href: "https://github.com/vaffel/react-components"}, "Open-source"), "." 
	            )
	        );
	    }
	});

/***/ },

/***/ 191:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	
	module.exports = React.createClass({
	    displayName: 'Container',
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        return this.transferPropsTo(
	            React.DOM.div({className: "container"}, this.props.children)
	        );
	    }
	});

/***/ },

/***/ 192:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var React = __webpack_require__(187);
	
	module.exports = React.createClass({
	    displayName: 'ReactLogo',
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        var classNames = ['react-logo'].concat(this.props.className);
	
	        return React.DOM.a({ href: '/' },
	            React.DOM.img(_.merge({}, this.props, {
	                src: '/img/react.svg',
	                className: classNames.join(' ')
	            })
	        ));
	    }
	});

/***/ },

/***/ 193:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React  = __webpack_require__(187);
	var config = __webpack_require__(189);
	var router = __webpack_require__(170);
	
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
	        return config['page-title'] + (query ? (' - ' + query) : '');
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
	            React.DOM.input({
	                type: "search", 
	                className: "search", 
	                onChange: this.onQueryChange, 
	                defaultValue: this.props.query, 
	                value: this.state.query, 
	                placeholder: this.props.placeholder, 
	                autoFocus: this.props.autoFocus}
	            )
	        );
	    }
	});

/***/ },

/***/ 194:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var ComponentItem = __webpack_require__(195);
	
	module.exports = React.createClass({
	    displayName: 'LatestComponents',
	
	    propTypes: {
	        components: React.PropTypes.array.isRequired,
	        listName:   React.PropTypes.string.isRequired,
	        className:  React.PropTypes.string
	    },
	
	    getDefaultProps: function() {
	        return {
	            className: 'component-list'
	        };
	    },
	
	    getComponentItem: function(c) {
	        return new ComponentItem({
	            key: c.name,
	            component: c
	        });
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.section({className: this.props.className}, 
	                React.DOM.h2(null, this.props.listName), 
	
	                React.DOM.ul(null, 
	                    this.props.components.map(this.getComponentItem)
	                )
	            )
	        );
	    }
	});

/***/ },

/***/ 195:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var ComponentLink = __webpack_require__(196);
	
	module.exports = React.createClass({
	    displayName: 'ComponentItem',
	
	    propTypes: {
	        component: React.PropTypes.object.isRequired
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.li(null, 
	                ComponentLink({component: this.props.component})
	            )
	        );
	    }
	});

/***/ },

/***/ 196:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React  = __webpack_require__(187);
	var config = __webpack_require__(189);
	var router = __webpack_require__(170);
	
	module.exports = React.createClass({
	    displayName: 'ComponentLink',
	
	    getUrl: function() {
	        return '/component/' + encodeURIComponent(this.props.component.name);
	    },
	
	    onClick: function(e) {
	        // If trying to open a new window, fall back
	        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 2) {
	            return;
	        }
	
	        e.preventDefault();
	
	        var pageTitle = this.props.component.name + ' - ' + config['page-title'];
	        history.pushState({}, pageTitle, e.target.href);
	        router.locationChanged();
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.a({className: "component-name", href: this.getUrl(), onClick: this.onClick}, 
	                this.props.children ||  this.props.component.name
	            )
	        );
	    }
	});

/***/ },

/***/ 197:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React  = __webpack_require__(187);
	var Layout = __webpack_require__(188);
	var ResultsTable = __webpack_require__(198);
	var ComponentStore = __webpack_require__(172);
	var SearchFilter = __webpack_require__(183);
	
	module.exports = React.createClass({
	    displayName: 'SearchPage',
	
	    getSearchResults: function() {
	        return SearchFilter.filter(this.props.route.query);
	    },
	
	    shouldComponentUpdate: function(nextProps, nextState) {
	        return (
	            this.props.route.query !== nextProps.route.query 
	        );
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            Layout({className: "search", query: this.props.route.query}, 
	                ResultsTable({results: this.getSearchResults()})
	            )
	        );
	    }
	});

/***/ },

/***/ 198:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var SearchResult = __webpack_require__(199);
	var NoResult = __webpack_require__(200);
	
	module.exports = React.createClass({
	    displayName: 'SearchResultsTable',
	
	    getComponentItem: function(item) {
	        return new SearchResult({
	            key: item.name,
	            component: item
	        });
	    },
	
	    getSearchResults: function() {
	        return this.props.results.map(this.getComponentItem);
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.table({className: "pure-table pure-table-horizontal results-table"}, 
	                React.DOM.thead(null, 
	                    React.DOM.tr(null, 
	                        React.DOM.th({className: "name"}, React.DOM.a({href: "#"}, "Name")), 
	                        React.DOM.th({className: "author"}, React.DOM.a({href: "#"}, "Author")), 
	                        React.DOM.th({className: "stars"}, React.DOM.a({href: "#"}, "Stars")), 
	                        React.DOM.th({className: "updated"}, React.DOM.a({href: "#"}, "Updated"))
	                    )
	                ), 
	                React.DOM.tbody(null, 
	                     this.props.results.length ?
	                        this.getSearchResults() : 
	                        NoResult(null)
	                    
	                )
	            )
	        );
	    }
	});

/***/ },

/***/ 199:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	var ComponentLink = __webpack_require__(196);
	
	module.exports = React.createClass({
	    displayName: 'SearchResultItem',
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.tr(null, 
	                React.DOM.td(null, 
	                    ComponentLink({component: this.props.component}), 
	                    React.DOM.p({className: "description"}, this.props.component.description)
	                ), 
	                React.DOM.td(null, this.props.component.author), 
	                React.DOM.td(null, this.props.component.stars || 0), 
	                React.DOM.td(null, this.props.component.modified.fromNow())
	            )
	        );
	    }
	});

/***/ },

/***/ 200:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	
	module.exports = React.createClass({
	    displayName: 'NoResult',
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.tr(null, 
	                React.DOM.td({colSpan: "4", className: "no-result"}, 
	                    "Your search did not return any results, unfortunately."
	                )
	            )
	        );
	    }
	});

/***/ },

/***/ 201:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React  = __webpack_require__(187);
	var Reflux = __webpack_require__(163);
	var Loader = __webpack_require__(202);
	var Layout = __webpack_require__(188);
	var MarkdownReadme = __webpack_require__(203);
	var ApiActions = __webpack_require__(174);
	var ComponentStore = __webpack_require__(172);
	var GithubRegex = /github\.com[\/:](.*?\/.*?)(\?|\/|\.git$)/i;
	
	function getStateFromStores(name) {
	    return {
	        componentInfo: ComponentStore.get(name)
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
	    },
	
	    getGithubUrl: function() {
	        var account = this.getGithubAccount();
	        if (!account) {
	            return false;
	        }
	
	        return 'https://github.com/' + account;
	    },
	
	    getGithubAccount: function() {
	        var info  = this.state.componentInfo,
	            repo  = (info.repository || {}).url,
	            page  = info.homepage,
	            bugs  = (info.bugs || {}).url,
	            parts = [repo, page, bugs].filter(Boolean);
	
	        var i = parts.length, matches;
	        while (i--) {
	            matches = parts[i].match(GithubRegex);
	            if (matches[1]) {
	                return matches[1];
	            }
	        }
	
	        return false;
	    },
	
	    getHomepageButton: function() {
	        var githubUrl = this.getGithubUrl();
	        var homePageUrl = this.state.componentInfo.homepage || '';
	
	        if (homePageUrl.match(/https?:\/\//i) && githubUrl !== homePageUrl) {
	            return (
	                React.DOM.a({href: homePageUrl, className: "pure-button"}, 
	                    React.DOM.i({className: "fa fa-globe"}), " Homepage"
	                )
	            );
	        }
	
	        return null;
	    },
	
	    getGithubButton: function() {
	        var githubUrl = this.getGithubUrl();
	        if (!githubUrl) {
	            return null;
	        }
	        
	        return (
	            React.DOM.a({href: githubUrl, className: "pure-button"}, 
	                React.DOM.i({className: "fa fa-github"}), " GitHub"
	            )
	        );
	    },
	
	    getGithubStarsButton: function() {
	        var githubUrl = this.getGithubUrl();
	
	        if (!githubUrl) {
	            return null;
	        }
	
	        return (
	            React.DOM.a({title: "Number of stars on Github", href: githubUrl + '/stargazers', className: "pure-button"}, 
	                React.DOM.i({className: "fa fa-star"}), " Stars"
	            )
	        );
	    },
	
	    getDownloadsButton: function() {
	        return (
	            React.DOM.a({title: "Downloads last week", href: "https://www.npmjs.org/package/" + this.state.componentInfo.name, className: "pure-button"}, 
	                React.DOM.i({className: "fa fa-arrow-circle-o-down"}), " Downloads"
	            )
	        );
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            Layout({className: "component-info", query: this.props.route.componentName, autoFocusSearch: false}, 
	                
	                    this.state.componentInfo ? 
	                    React.DOM.div(null, 
	                        React.DOM.aside(null, 
	                        React.DOM.div({className: "toolbar"}, 
	                            this.getGithubButton(), 
	                            this.getHomepageButton(), 
	                            this.getGithubStarsButton(), 
	                            this.getDownloadsButton()
	                        )
	                        ), 
	                        MarkdownReadme({component: this.state.componentInfo})
	                    ) :
	                    Loader(null)
	                
	            )
	        );
	    }
	});

/***/ },

/***/ 202:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(187);
	
	module.exports = React.createClass({
	    displayName: 'Loader',
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.div({className: "loader"}, 
	                React.DOM.div({className: "dot"}), 
	                React.DOM.div({className: "dot"}), 
	                React.DOM.div({className: "dot"}), 
	                React.DOM.div({className: "dot"}), 
	                React.DOM.div({className: "dot"})
	            )
	        );
	    }
	});

/***/ },

/***/ 203:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	// Hey, if Facebook/Instagram can do it, so can I ;-)
	var IS_BROWSER = typeof window !== 'undefined';
	var IS_MOBILE  = (IS_BROWSER && (
	    navigator.userAgent.match(/Android/i)
	    || navigator.userAgent.match(/webOS/i)
	    || navigator.userAgent.match(/iPhone/i)
	    || navigator.userAgent.match(/iPad/i)
	    || navigator.userAgent.match(/iPod/i)
	    || navigator.userAgent.match(/BlackBerry/i)
	    || navigator.userAgent.match(/Windows Phone/i)
	));
	
	var _ = __webpack_require__(1);
	var React = __webpack_require__(187);
	var marked = __webpack_require__(204);
	var config = __webpack_require__(189);
	var CodeMirror = typeof window === 'undefined' ? function() {} : window.CodeMirror;
	var GithubRegex = /github\.com[\/:](.*?\/.*?)(\?|\/|\.git$)/i;
	
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
	        if (IS_MOBILE) {
	            return;
	        }
	
	        // Apply CodeMirror to multi-line code elements
	        var codeEls = this.getDOMNode().querySelectorAll('pre > code'), preEl, lang;
	        for (var i = 0; i < codeEls.length; i++) {
	            preEl = codeEls[i].parentNode;
	            lang  = (codeEls[i].getAttribute('class') || '');
	            lang  = lang.replace(/.*?lang\-(.*)/, '$1').split(/\s+/)[0];
	
	            CodeMirror(function(elt) {
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
	                new RegExp('<a href="' + matches[1] + '">', 'g'),
	                '<a href="' + githubUrl + file + '">'
	            );
	        }
	
	        return html;
	    },
	
	    getGithubUrl: function() {
	        var account = this.getGithubAccount();
	        if (!account) {
	            return false;
	        }
	
	        return 'https://github.com/' + account;
	    },
	
	    getGithubAccount: function() {
	        var info  = this.props.component,
	            repo  = (info.repository || {}).url,
	            page  = info.homepage,
	            bugs  = (info.bugs || {}).url,
	            parts = [repo, page, bugs].filter(Boolean);
	
	        var i = parts.length, matches;
	        while (i--) {
	            matches = parts[i].match(GithubRegex);
	            if (matches[1]) {
	                return matches[1];
	            }
	        }
	
	        return false;
	    },
	
	    /* jshint quotmark:false, newcap:false */
	    render: function() {
	        var html = this.fixRelativeUrls(marked(this.props.component.readme));
	        return (
	            React.DOM.section({
	                className: "readme", 
	                dangerouslySetInnerHTML: { __html: html}}
	            )
	        );
	    }
	});

/***/ }

});
//# sourceMappingURL=bundle.js.map