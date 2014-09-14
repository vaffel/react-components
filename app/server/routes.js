'use strict';

var basePath = require('path').resolve(__dirname + '/../../');
var _        = require('lodash');
var config   = require('app/config');
var isDev    = process.env.NODE_ENV === 'development';
var render   = require('app/react/renderer');
var template = basePath + '/templates/default.html';
var pkgInfo  = require(basePath + '/package.json');
var params   = {
    'package': pkgInfo,
    'page': {
        description: pkgInfo.description,
        title: 'React Components'
    }
};

var controllers = {
    components: require('app/controllers/components')
};

var stores = {
    components: require('app/stores/components-store')
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

    reply(render(request, reqParams, template))
        .header('X-UA-Compatible', 'IE=edge,chrome=1')
        .header('Cache-Control', 'public, must-revalidate, max-age=150')
        .header('Content-Security-Policy', [
            'script-src \'self\'' + liveReloadSrc + analyticsSrc,
            'frame-src \'none\'',
            'object-src \'none\''
        ].join(';'));
}

module.exports = function(server) {
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
};