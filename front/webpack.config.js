var path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const ENTRY_DIR = path.resolve(__dirname, './src');

var config = {
    entry: ENTRY_DIR + '/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin()
        ]
    },
    module: {
        rules: [
            {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'},
            {
                test: /\.svg$/,
                use: "react-svg-loader"
            },
            {
                test: /\.js?/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: "./static/front/dist/[hash].[ext]",
                    },
                },
            }
        ]
    }
};

module.exports = config;