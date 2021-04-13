const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const sm = require('./stringmatching.js');

const port = 6969;

/**
 * Handler untuk messaging
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const messageAPI = (req, res) => {
  let body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () =>{
    body = Buffer.concat(body).toString()
    response = sm.generateReply(body);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(response);
  });
}

/**
 * Handler untuk static file serving
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const serveFile = (req, res) => {
  let filename = req.url;
  if(filename == '/') filename = '/index.html';
  filename = `${__dirname}/static${filename}`;
  let ext = path.extname(filename);
  let ctype = 'application/octet-stream';
  switch(ext){
    case '.js':
      ctype = 'text/javascript';
      break;
    case '.css':
      ctype = 'text/css';
      break;
    case '.html':
      ctype = 'text/html';
      break;
  }

  fs.readFile(filename)
    .then((data) => {
      res.writeHead(200, {'Content-Type': ctype});
      res.end(data);
    })
    .catch((err) => {
      res.writeHead(404, err);
      res.end();
    });
}

let server = http.createServer((req, res) => {
  if(req.url == '/message' && req.method == 'POST') return messageAPI(req, res);
  else return serveFile(req, res);
});

server.listen(port);
console.log(`Listening on http://localhost:${port}...`);