const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "path": require.resolve("path-browserify"),
        "fs": false,
        "child_process": false,
        "net": false,
        "tls": false,
        "process": require.resolve("process/browser")
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ];

    config.ignoreWarnings = [/Failed to parse source map/];
    
    // Add this line to resolve the issue with framer-motion
    config.resolve.alias = {
        ...config.resolve.alias,
        'process/browser': 'process/browser.js'
    };

    return config;
}