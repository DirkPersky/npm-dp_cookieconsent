const path = require('path');
const webpackConfig = require('webpack');
let FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let packageJson = require('./package');

class dpWebpack {

    getName(){
        let name = packageJson.name;
        return name.replace('/','-');
    }
    /**
     * Create a new instance.
     */
    constructor() {
        this.config = {
            publicPath: './dist',
        };

        this.webpackConfig = {
            entry: '',
            output: {},
            plugins: [],
            module: {
                rules: []
            },
            resolve: {
                extensions: [".js"]
            },
            node: {
                fs: "empty" // avoids error messages
            }
        };
        // Uglify & Compress JS
        if(this.isProduction()) {
            this.webpackConfig.optimization = {
                minimize: true
            };
        }
    }
    isProduction(){
        return (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') ? true: false;
    }
    /**
     * Build the Webpack configuration object.
     */
    build() {
        this.buildEntry()
            .buildOutput()
            .buildRules()
            .buildPlugins()
        ;

        return this.webpackConfig;
    }
    /**
     * Build the entry object.
     */
    buildEntry() {
        this.webpackConfig.entry = [
            './'+packageJson.js,
            './'+packageJson.sass
        ];

        return this;
    }
    /**
     * Build the output object.
     */
    buildOutput() {
        this.webpackConfig.output = {
            path: path.resolve(__dirname,  this.config.publicPath+'/js'),
            filename: this.getName()+'.js'
        };

        return this;
    }
    /**
     * Build the rules array.
     */
    buildRules() {
        // JavaScript & TYPESCRIPT HANDLER
        this.webpackConfig.module.rules.push({
            test: /\.(js)x?$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                }
            }
        });
        // Copy Fonts to Public dir
        this.webpackConfig.module.rules.push({
            test: /\.(woff2?|ttf|eot|svg|otf)$/,
            loader: 'file-loader',
            options: {
                name: path => {
                    if (!/node_modules|bower_components/.test(path)) {
                        return '../fonts/[name].[ext]?[hash]'.replace(/@/g, '');
                    }

                    return '../fonts/' + path
                        .replace(/\\/g, '/')
                        .replace(/@/g, '')
                        .replace(
                            /((.*(node_modules|bower_components))|fonts|font|assets)\//g, ''
                        ) + '?[hash]';
                },
                publicPath: ''
            }
        });
        // sass / scss loader for webpack
        this.webpackConfig.module.rules.push({
            test: /\.(sass|scss)$/,
            exclude: /(node_modules|bower_components)/,
            loader: ExtractTextPlugin.extract([
                'css-loader', 'sass-loader'
            ])
        });

        // Template
        this.webpackConfig.module.rules.push({
            test: /\.(html)$/,
            use: {
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            }
        });

        // json loader for webpack
        this.webpackConfig.module.rules.push({
            test: /\.(json)$/,
            type: 'javascript/auto',
            use: {
                loader: 'json-loader',
            }
        });

        return this;
    }
    /**
     * Build the plugins array.
     */
    buildPlugins() {
        // Add Frindly Errors
        this.webpackConfig.plugins.push(
            new FriendlyErrorsWebpackPlugin({
                clearConsole: true
            })
        );
        // say ExtractTextPlugin to export his results to style.css
        this.webpackConfig.plugins.push(
            new ExtractTextPlugin({ // define where to save the file
                filename: '../css/'+this.getName()+'.css',
                allChunks: true,
            })
        );

        return this;
    }
}


module.exports = new dpWebpack().build();
