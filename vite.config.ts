import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	root: 'src',
	base: './',
	publicDir: 'public',
	server: {
		port: parseInt(process.env.PORT || '8000')
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src')
		},
		extensions: ['.ts', '.js', '.jsx', '.tsx', '.json']
	}
})
