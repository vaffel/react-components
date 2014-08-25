webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var _ = __webpack_require__(2);
	var React = __webpack_require__(1);
	var router = __webpack_require__(3);
	var isBrowser = typeof window !== 'undefined';
	
	var App = React.createClass({
	    displayName: 'App',
	
	    propTypes: {
	        path: React.PropTypes.string.isRequired
	    },
	
	    getPage: function() {
	        var match = router(this.props.path);
	
	        if (!match) {
	            console.error('Could not match URL (' + this.props.path + ')');
	            return null;
	        }
	
	        return new match.page(_.merge({}, this.state, {
	            query: match.query || {},
	            route: match.route || {},
	        }));
	    },
	
	    componentDidMount: function() {
	        // @todo hook up pushstate
	    },
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        return this.getPage();
	    }
	});
	
	if (isBrowser) {
	    React.renderComponent(new App({
	        path: window.location.pathname + window.location.search
	    }), document.getElementById('root'));
	}
	
	module.exports = App;

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
	var map = __webpack_require__(6);
	
	module.exports = function router(url) {
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
	        params = match(pattern, path);
	
	        if (params) {
	            return {
	                route: params,
	                query: query,
	                page : map[pattern]
	            };
	        }
	    }
	
	    return null;
	};
	
	function match(pattern, url) {
	    var vars = pattern.match(/(:[a-zA-Z0-9]+)/g),
	        re = new RegExp('^' + pattern.replace(/(:[a-zA-Z0-9]+)/g, '([a-zA-Z0-9]+)') + '$'),
	        matches = url.match(re),
	        params = {},
	        varname;
	
	    if (!matches) {
	        return null;
	    }
	
	    for (var i = 1; i < matches.length; i++) {
	        varname = vars[i - 1].substring(1);
	        params[varname] = matches[i];
	    }
	
	    return params;
	}

/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Front = __webpack_require__(60);
	
	module.exports = {
	    '/': Front,
	    '/search/:query': Front
	};

/***/ },

/***/ 60:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(124);
	var Container = __webpack_require__(125);
	var ReactLogo = __webpack_require__(126);
	var SearchInput = __webpack_require__(127);
	var Loader = __webpack_require__(128);
	
	var FrontPage = React.createClass({
	    displayName: 'FrontPage',
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.div(null, 
	                React.DOM.header(null, 
	                    Container(null, 
	                        ReactLogo(null), 
	                        React.DOM.h1(null, "React Components"), 
	
	                        SearchInput({query: ""})
	                    )
	                ), 
	
	                React.DOM.main(null, 
	                    Container(null, 
	                        Loader(null)
	                    )
	                )
	            )
	        );
	    }
	});
	
	module.exports = FrontPage;

/***/ },

/***/ 124:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(8);


/***/ },

/***/ 125:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(124);
	
	module.exports = React.createClass({
	    displayName: 'Container',
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.div({className: "container"}, this.props.children)
	        );
	    }
	});

/***/ },

/***/ 126:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(2);
	var React = __webpack_require__(124);
	
	module.exports = React.createClass({
	    displayName: 'ReactLogo',
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        var classNames = ['react-logo'].concat(this.props.className);
	
	        return React.DOM.img(_.merge({}, this.props, {
	            src: '/img/react.svg',
	            className: classNames.join(' ')
	        }));
	    }
	});

/***/ },

/***/ 127:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(124);
	
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
	
	    componentDidMount: function() {
	        // Use to bring up the "looking glass"-icon
	        this.getDOMNode().setAttribute('results', 5);
	    },
	
	    /* jshint trailing:false, quotmark:false, newcap:false */
	    render: function() {
	        return (
	            React.DOM.input({
	                type: "search", 
	                className: "search", 
	                defaultValue: this.props.query, 
	                placeholder: this.props.placeholder, 
	                autoFocus: this.props.autoFocus}
	            )
	        );
	    }
	});

/***/ },

/***/ 128:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(124);
	
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

/***/ }

});
//# sourceMappingURL=bundle.js.map