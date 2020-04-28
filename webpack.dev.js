const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        allowedHosts: ['127.0.0.1', 'localhost'],
        contentBase: path.resolve(__dirname, 'static/dist'),
        compress: true,
        host: '0.0.0.0',
        hot: true,
        overlay: {
            warnings: true,
            errors: true
        },
        port: 3333,
        publicPath: '/static/dist/'
    }
});