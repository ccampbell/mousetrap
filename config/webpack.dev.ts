import * as webpackMerge from 'webpack-merge';
import * as helpers from './helpers';
import commonConfig from './webpack.base';

// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
import { CheckerPlugin } from 'awesome-typescript-loader';
import * as HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import * as EvalSourceMapDevToolPlugin from 'webpack/lib/EvalSourceMapDevToolPlugin';


/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
export default () => {
    const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

    return webpackMerge(commonConfig({ env: ENV }), {
            /**
             * Options affecting the output of the compilation.
             *
             * See: http://webpack.github.io/docs/configuration.html#output
             */
        output: {

            /**
             * The output directory as absolute path (required).
             *
             * See: http://webpack.github.io/docs/configuration.html#output-path
             */
            path: helpers.root('dist'),

            /**
             * Specifies the name of each output file on disk.
             * IMPORTANT: You must not specify an absolute path here!
             *
             * See: http://webpack.github.io/docs/configuration.html#output-filename
             */
            filename: '[name].js',

            publicPath: './',
        },

        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
            ignored: helpers.exclude
        },

        devtool: 'inline-source-map',

        module: {

            rules: [
                {
                    test: /\.ts$/,
                    loader: 'awesome-typescript-loader',
                    options: {
                        useCache: true,
                        sourceMap: true,
                    },
                    exclude: [helpers.exclude]
                },
            ]

        },

        plugins: [
            new CheckerPlugin(),

            new HardSourceWebpackPlugin({
                cacheDirectory: helpers.root('.tmp/HDCache')
            }),

            new EvalSourceMapDevToolPlugin({
                moduleFilenameTemplate: '[resource-path]',
                sourceRoot: 'webpack:///'
            }),
        ],
    });
};
