var path = require('path');
var webpack = require('webpack');

module.exports = {
    cache: true,
    entry: {
        bundle: './app/root',
        vendor: ['react/addons', 'lodash', 'lunr', 'moment', 'reflux', 'xhr'],
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