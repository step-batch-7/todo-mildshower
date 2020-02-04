/* eslint-disable no-magic-numbers */
const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const {generateTodoList, addTodoListToCollection} = require('./todoListCollection');
const CONTENT_TYPES = require('./contentTypes.json');

const TODO_DATA_STORE_PATH = `${__dirname}/../data/todoList.json`;
const TODO_LISTS = generateTodoList(require(TODO_DATA_STORE_PATH));

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

const serveTodoLists = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(TODO_LISTS.toJSONString());
};

const addTodoList = function(req, res) {
  const {title, taskNames} = JSON.parse(req.body);
  const newTodoListJson = addTodoListToCollection(TODO_LISTS, title, taskNames);
  TODO_LISTS.save(writeFileSync.bind(null, TODO_DATA_STORE_PATH));
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(newTodoListJson);
};

const toggleTask = function(req, res){
  const {todoListId, taskId} = JSON.parse(req.body);
  TODO_LISTS.toggleTaskStatus(todoListId, taskId);
  TODO_LISTS.save(writeFileSync.bind(null, TODO_DATA_STORE_PATH));
  res.end();
};

const getNotFoundResponse = function(req, res) {
  res.statusCode = 404;
  res.statusMessage = 'NOT FOUND';
  res.end(fillTemplate('notFound.html', {path: req.url}));
};

const app = new App();

app.use(receiveBody);
app.get(getStaticFileResponse);
app.get(serveTodoLists, '/records');
app.post(addTodoList, '/addTodoList');
app.post(toggleTask, '/toggleTask');
app.use(getNotFoundResponse);

module.exports = {app};
