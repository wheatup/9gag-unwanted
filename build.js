const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');
const config = defaults.__get__('config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Consolidate chunk files instead
config.optimization.splitChunks = {
	cacheGroups: {
		default: false,
	},
};
// Move runtime into bundle instead of separate file
config.optimization.runtimeChunk = false;
config.optimization.minimize = false;
// JS
config.output.filename = '[name].js';
// CSS. "5" is MiniCssPlugin
const miniCssExtractPlugin = config.plugins.find(plugin => plugin instanceof MiniCssExtractPlugin);
if (miniCssExtractPlugin) {
	miniCssExtractPlugin.options.filename = '[name].css';
	miniCssExtractPlugin.options.publicPath = '../';
}