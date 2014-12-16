'use strict';

require('node-jsx').install({ extension: '.jsx' });

var _       = require('lodash');
var config  = require('app/config');
var Hapi    = require('hapi');
var isDev   = process.env.NODE_ENV === 'development';
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
        css: [
            '/css/pure-min.css',
            '/css/codemirror.css',
            '/css/components.css'
        ],
        js: [
            '/js/codemirror-compressed.js',
            '/js/analytics.js',
            '/dist/vendor.bundle.js',
            '/dist/bundle.js',
        ]
    }
};

var controllers = {
    components: require('app/controllers/components')
};

// Prime component store
var ComponentStore = require('app/stores/components-store');
ComponentStore.populateFromDatabase();

// Have component store fetch new components every once in a while
setInterval(
    ComponentStore.populateFromDatabase.bind(ComponentStore),
    config['poll-interval']
);

function getPageTitle(query) {
    if (!query) {
        return params.page.title;
    }

    return query + ' - ' + params.page.title;
}

function handleRequest(request, reply) {
    var reqParams = _.merge({}, params, {
        page: {
            title: getPageTitle(request.params.query || request.params.component)
        }
    });

    var liveReloadSrc = isDev ? ' localhost:35729' : '';
    var analyticsSrc = ' http://www.google-analytics.com https://www.google-analytics.com';

    reply(render(request, reqParams, tpl('default')))
        .header('X-UA-Compatible', 'IE=edge,chrome=1')
        .header('Cache-Control', 'public, must-revalidate, max-age=150')
        .header('Content-Security-Policy', [
            'script-src \'self\'' + liveReloadSrc + analyticsSrc,
            'frame-src \'none\'',
            'object-src \'none\''
        ].join(';'));
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
    path: '/component/{component}',
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
        handler: controllers.components.componentInfo
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
        handler: {
            directory: {
                path: 'public',
                lookupCompressed: true
            }
        },
        cache: { expiresIn: 3600 * 1000, privacy: 'public' }
    }
});

server.start(function() {
    console.log('Server running at:', server.info.uri);
});