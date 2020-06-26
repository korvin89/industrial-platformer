const path = require('path');
// удаляет неактуальные файлы из output директории
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// собирает index.html
const HTMLWebpackPlugin = require('html-webpack-plugin');
// копирует нужные файлы в output директорию
const CopyWebpackPlugin = require('copy-webpack-plugin');
// складывает все стили в один файл
const MiniCssExtrcatPlugin = require('mini-css-extract-plugin');
// оптимизирует и минифицирует css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// минифицирует js
const TerserWebpackPlugin = require('terser-webpack-plugin');
// создает инфорграфику состава исходного бандла
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const getOptimizationConfig = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserWebpackPlugin()
        ];
    }

    return config;
};

const getCssLoaders = (extra) => {
    const loaders = [
        {
            loader: MiniCssExtrcatPlugin.loader,
            options: {
                // hot module replacement
                hmr: isDev,
                reloadAll: true
            }
        },
        'css-loader'
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
};

const getBabelOptions = (preset) => {
    const options = {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-class-properties']
    };

    if (preset) {
        options.presets.push(preset)
    }

    return options;
};

const getJsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: getBabelOptions()
    }];

    if (isDev) {
        loaders.push('eslint-loader');
    }

    return loaders;
}

const getPlugins = () => {
    const plugins = [
        new HTMLWebpackPlugin({
            template: 'public/index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'public/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        new MiniCssExtrcatPlugin({
            filename: getFilename('css')
        })
    ];

    if (isProd) {
        plugins.push(new BundleAnalyzerPlugin());
    }

    return plugins;
}

const getFilename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

module.exports = {
    context: path.resolve(__dirname),
    mode: 'development',
    entry: ['@babel/polyfill', './src/index.ts'],
    output: {
        filename: getFilename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: getOptimizationConfig(),
    devServer: {
        inline: true,
        port: 4200,
        hot: isDev,
    },
    devtool: isDev ? 'source-map' : '',
    plugins: getPlugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: getCssLoaders()
            },
            {
                test: /\.(sass|scss)$/,
                use: getCssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                    },
                }],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: getJsLoaders()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: getBabelOptions('@babel/preset-typescript')
                }
            },
        ]
    }
};
