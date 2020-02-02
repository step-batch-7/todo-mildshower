const { createServer } = require('http');
const { info } = require('console');
const { app } = require('./lib/handlers');

const main = function() {
  const [, , port] = process.argv;
  const server = createServer();
  server.on('request', (req, res) => app.serve(req, res));
  server.on('close', () => info('server is closed'));
  server.listen(port, () => {
    info('server is listening on :', server.address().port);
  });
};

main();
