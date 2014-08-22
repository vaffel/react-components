var path = require('path');

module.exports = {
    cache: true,
    entry: {
        bundle: './app/root'
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
            { test: /\.js$/,  loader: 'jsx-loader' },
            { test: /\.jsx$/, loader: 'jsx-loader?insertPragma=React.DOM' },
        ]
    },
    plugins: []
};