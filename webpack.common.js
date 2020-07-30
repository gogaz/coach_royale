const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    entry: './static/app/index.js',
    resolve: { modules: [
        'node_modules',
        path.resolve(__dirname, 'static/app')
    ]},
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
    ],
    module: {
        rules: [
            {
                test: /\.json$/,
                type: 'javascript/auto',
                loader: 'json-loader'
            },
            {
                test: /\.(png|woff|woff2|eot|ttf)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.js$/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                ]
            },
            {
                test: /\.(jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: "./static/dist/[hash].[ext]",
                    },
                },
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'static/dist')
    },
};
