const path = require('path')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const {
// 	CleanWebpackPlugin
// } = require('clean-webpack-plugin')

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'index.js',
		// assetModuleFilename: 'assets/[hash][ext][query]'
		// globalObject: 'self'
	},
	devServer: {
		static: 'dist',
		open: true
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	// plugins: [
	// 	new CleanWebpackPlugin(),
	// 	new HtmlWebpackPlugin({
	// 		template: './src/public/index.html'
	// 	}),
	// ]
}