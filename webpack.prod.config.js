const path = require('path')

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'index.js'
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	}
}
