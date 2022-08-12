const fs = require('fs');
const http = require('http');

function getType(_url) {
	var types = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.svg': 'svg+xml',
		'.mp4': 'video/mp4',
	}
	for (var key in types) {
		if (_url.endsWith(key)) {
			return types[key];
		}
	}
	return 'text/plain';
}

const server = http.createServer(function (req, res) {
	const url = 'dist' + (req.url.endsWith('/') ? req.url + 'index.html' : req.url);
	if (fs.existsSync(url)) {
		fs.readFile(url, (err, data) => {
			if (!err) {
				res.writeHead(200, {
					'Content-Type': getType(url)
				});
				res.end(data);
			}
		});
	}
});

const port = process.env.PORT || 3000;
server.listen(port, function () {
	console.log('To view your app, open this link in your browser: http://localhost:' + port);
});