'use strict';

var _ = require('lodash');
var fs = require('fs');
var App = require('app/root');
var React = require('react/addons');
var isDev = process.env.NODE_ENV === 'development';
var templates = {};

module.exports = function(request, params, template) {
    var isCrawler = false; // @todo Probably want to render SEO-markup
    var app = new App({ path: request.url.path });
    var body = '';

    if (isCrawler) {
        body = React.renderComponentToStaticMarkup(app);
    } else {
        body = React.renderComponentToString(app);
    }

    // Set content of the page
    params.page.body = body;

    // In dev-mode, re-read the template each time (to allow changes)
    if (isDev || !templates[template]) {
        templates[template] = _.template(
            fs.readFileSync(template, { encoding: 'utf8' })
        );
    }

    // Render template
    var rendered = templates[template](params);

    // Inject livereload?
    return isDev ? liveReloadify(rendered) : rendered;
};

/* jshint quotmark: double */
function liveReloadify(rendered) {
    var port = 35729;
    var src = "' + (location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':" + port + "/livereload.js?snipver=1";
    var snippet = "\n<script>document.write('<script src=\"" + src + "\"><\\/script>')</script>\n";

    return rendered.replace(/<\/body>/, function(w) {
        return snippet + w;
    });
}