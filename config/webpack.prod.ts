import * as webpackMerge from 'webpack-merge';
import * as helpers from './helpers';
import commonConfig from './webpack.base';

/**
 * Webpack Plugins
 */
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';


export default () => {
    const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
    const useSourcemaps: boolean = process.env.USE_SOURCEMAPS !== undefined;

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
        },

        devtool: useSourcemaps ? 'source-map' : false,

        module: {
            rules: [{
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    useCache: false
                },
                exclude: [helpers.exclude]
            }]
        },

        /**
         * Add additional plugins to the compiler.
         *
         * See: http://webpack.github.io/docs/configuration.html#plugins
         */
        plugins: [
            /**
             * Plugin: UglifyJsPlugin
             * Description: Minimize all JavaScript output of chunks.
             * Loaders are switched into minimizing mode.
             *
             * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
             *
             * NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
             */
            new UglifyJsPlugin({
                sourceMap: useSourcemaps,
                cache: true,
                parallel: true,
                uglifyOptions: {
                    mangle: false,
                    compress: false,
                    comments: false,
                    warnings: true
                }
            })
        ]
    });
};
