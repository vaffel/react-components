'use strict';

require('node-jsx').install({ extension: '.jsx' });

var isDev    = process.env.NODE_ENV === 'development';
var winston  = require('winston');
var Pushover = require('winston-pushover').Pushover;

if (!isDev) {
    winston.add(Pushover, {
        userKey: process.env.PUSHOVER_USER_KEY,
        token: process.env.PUSHOVER_TOKEN,
        handlExceptions: true
    });
}

var _       = require('lodash');
var Hapi    = require('hapi');
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
        cache: { expiresIn: 1000 * 60 * 5, privacy: 'public' }
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