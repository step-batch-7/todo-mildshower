const query = require('querystring');

const receiveBody = function(req, res, next) {
  let body = '';

  req.on('data', data => {
    body += data;
  });

  req.on('end', () => {
    req.body = body;
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.body = query.parse(body);
    }
    if(req.headers['content-type'] === 'application/json'){
      req.body = JSON.parse(body);
    }
    next();
  });
};

module.exports = receiveBody;
