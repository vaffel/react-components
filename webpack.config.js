var path = require('path');
var webpack = require('webpack');
var config = {
    cache: true,
    entry: {
        bundle: './app/root',
        vendor: ['react/addons', 'lodash', 'lunr', 'moment', 'reflux', 'xhr', 'marked'],
    },
    output: {
        path: path.join(__dirname, 'public', 'dist'),
        publicPath: 'public/dist/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    module: {
        loaders: [
            // required to write 'require('./style.css')'
            { test: /\.css$/,    loader: 'style-loader!css-loader' },

            // required for react jsx
            { test: /\.jsx?$/,  loader: 'jsx-loader' }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.ContextReplacementPlugin(/moment\.js[\/\\]lang$/, /^\.\/(de|pl)$/)
    ]
};

if (process.env.NODE_ENV !== 'development') {
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;