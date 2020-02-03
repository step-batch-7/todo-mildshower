const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const Todo = require('./todo');
const CONTENT_TYPES = require('./contentTypes.json');

const TODO_DATA_STORE_PATH = `${__dirname}/../data/todoList.json`;

const TODO_LIST = require(TODO_DATA_STORE_PATH);

const isExistingFile = function(filePath) {
  return existsSync(filePath) && statSync(filePath).isFile();
};

const getStaticFileResponse = function(req, res, next) {
  const path = req.url === '/' ? '/index.html' : req.url;
  const filePath = `public${path}`;

  if (!isExistingFile(filePath)) {
    return next();
  }

  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(readFileSync(filePath));
};

const fillTemplate = function(fileName, replaceTokens) {
  const path = `./templates/${fileName}`;
  const template = readFileSync(path, 'UTF8');
  const keys = Object.keys(replaceTokens);

  const replace = (template, key) => {
    const regExp = new RegExp(`__${key}__`, 'g');
    return template.replace(regExp, replaceTokens[key]);
  };

  return keys.reduce(replace, template);
};

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
    next();
  });
};

const saveTodo = function(req, res) {
  const todo = Todo.from(JSON.parse(req.body));
  TODO_LIST.unshift(todo);
  console.log(TODO_LIST);
  writeFileSync(TODO_DATA_STORE_PATH, JSON.stringify(TODO_LIST, null, 2));
  res.setHeader('Content-Type', 'text/html');
  res.end(todo.toHtml());
};

const getNotFoundResponse = function(req, res) {
  res.statusCode = 404;
  res.statusMessage = 'NOT FOUND';
  res.end(fillTemplate('notFound.html', {path: req.url}));
};

const app = new App();

app.use(receiveBody);
app.get(getStaticFileResponse);
app.post(saveTodo, '/saveTodo');
app.use(getNotFoundResponse);

module.exports = {app};
