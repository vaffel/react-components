'use strict';

require('node-jsx').install({ extension: '.jsx' });

var _       = require('lodash');
var config  = require('app/config');
var Hapi    = require('hapi');
var isDev   = process.env.NODE_ENV === 'development';
var min     = isDev ? '' : '.min';
var server  = new Hapi.Server(process.env.REACT_COMPONENTS_PORT || 3000);
var render  = require('app/react/renderer');
var pkgInfo = require('./package.json');
var tpl     = function(file) { return __dirname + '/templates/' + file + '.html'; };
var params = {
    'package': pkgInfo,
    'page': {
        description: pkgInfo.description,
        title: 'React Components'
    },
    'resources': {
        css: '/css/components.css',
        js: [
            '/dist/vendor.bundle' + min + '.js',
            '/dist/bundle' + min + '.js'
        ]
    }
};

var ServerActions = require('app/actions/server');
var NpmApi = require('app/api/npm-api');

var controllers = {
    components: require('app/controllers/components')
};

var stores = {
    components: require('app/stores/components-store')
};

function startNpmModulesPolling() {
    // Have the API module listen for actions
    NpmApi.listen();

    // Do a request every once in a while
    setInterval(ServerActions.getModulesFromNpm, config['poll-interval']);
    
    // Fetch straight away so we have something to deliver to clients
    ServerActions.getModulesFromNpm();
}

function getPageTitle(query) {
    if (!query) {
        return params.page.title;
    }

    return params.page.title + ' - ' + query;
}

function handleRequest(request, reply) {
    var reqParams = _.merge({}, params, {
        page: {
            title: getPageTitle(request.params.query)
        }
    });

    reply(render(
        request,
        reqParams,
        tpl('default')
    ));
}

server.route({
    method: 'GET',
    path: '/',
    handler: handleRequest
});

server.route({
    method: 'GET',
    path: '/search/{query}',
    handler: handleRequest
});

server.route({
    method: 'GET',
    path: '/api/components',
    config: {
        handler: controllers.components.componentsList,
        cache: { expiresIn: config['poll-interval'], privacy: 'public' }
    }
});

server.route({
    method: 'GET',
    path: '/api/components/{component}',
    config: {
        handler: controllers.components.componentInfo,
        cache: { expiresIn: config['poll-interval'], privacy: 'public' }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            lookupCompressed: true
        }
    }
});

server.start(function() {
    console.log('Server running at:', server.info.uri);

    startNpmModulesPolling();
});