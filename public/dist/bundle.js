webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var _ = __webpack_require__(1);
	var React = __webpack_require__(3);
	var router = __webpack_require__(163);
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

/***/ 163:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var queryParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
	var map = __webpack_require__(164);
	
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

/***/ 164:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Front = __webpack_require__(165);
	
	module.exports = {
	    '/': Front,
	    '/search/:query': Front
	};

/***/ },

/***/ 165:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(166);
	var Container = __webpack_require__(167);
	var ReactLogo = __webpack_require__(168);
	var SearchInput = __webpack_require__(169);
	
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
	
	                        SearchInput(null)
	                    )
	                ), 
	
	                React.DOM.main(null, 
	                    Container(null, 
	                        "Content!"
	                    )
	                )
	            )
	        );
	    }
	});
	
	module.exports = FrontPage;

/***/ },

/***/ 166:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);


/***/ },

/***/ 167:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(166);
	
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

/***/ 168:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var React = __webpack_require__(166);
	
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

/***/ 169:
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	'use strict';
	
	var React = __webpack_require__(166);
	
	module.exports = React.createClass({
	    displayName: 'SearchInput',
	
	    propTypes: {
	        autoFocus: React.PropTypes.bool,
	        placeholder: React.PropTypes.string
	    },
	
	    getDefaultProps: function() {
	        return {
	            autoFocus: true,
	            placeholder: 'Component name, keyword or similar'
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
	                placeholder: this.props.placeholder, 
	                autoFocus: this.props.autoFocus}
	            )
	        );
	    }
	});

/***/ }

});
//# sourceMappingURL=bundle.js.map