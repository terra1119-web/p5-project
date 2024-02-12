import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	// root: 'src/public',
	root: 'src',
	base: './', // 相対パスでpublicなど参照できるように
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
