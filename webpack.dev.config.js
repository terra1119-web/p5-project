const path = require('path')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const {
// 	CleanWebpackPlugin
// } = require('clean-webpack-plugin')

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'index.js',
		// assetModuleFilename: 'assets/[hash][ext][query]'
		// globalObject: 'self'
	},
	devServer: {
		static: 'src/public',
		open: true
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
		modules: [
			"node_modules"
		],
		extensions: ['.ts', '.js', '.jsx', '.tsx', '.json']
	},
	module: {
		rules: [{
			// 拡張子 .ts の場合
			test: /\.ts$/,
			// TypeScript をコンパイルする
			use: 'ts-loader'
		}]
	},
	// plugins: [
	// 	new CleanWebpackPlugin(),
	// 	new HtmlWebpackPlugin({
	// 		template: './src/public/index.html'
	// 	}),
	// ]
}