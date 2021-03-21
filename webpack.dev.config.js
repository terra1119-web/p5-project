const path = require('path')

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'index.js'
	},
	devServer: {
		contentBase: 'dist',
		open: true
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	}
}
