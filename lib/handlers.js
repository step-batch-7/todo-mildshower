/* eslint-disable no-magic-numbers */
const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const Todo = require('./todo');
const CONTENT_TYPES = require('./contentTypes.json');

const TODO_DATA_STORE_PATH = `${__dirname}/../data/todoList.json`;
const TODO_LIST = require(TODO_DATA_STORE_PATH).map(todo => {
  return new Todo(todo.title, todo.id, todo.tasks);
});
let currTodoId = TODO_LIST[0] ? +TODO_LIST[0].id + 1 : 0;

const getTodoId = () => {
  return currTodoId++;
};

const getTodoById = function(todoId){
  // console.log(TODO_LIST, todoId);
  return TODO_LIST.find(todo => todo.isIdSame(todoId));
};

const saveTodoList = function(){
  writeFileSync(TODO_DATA_STORE_PATH, JSON.stringify(TODO_LIST, null, 2));
};

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

const serveTodoList = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(TODO_LIST));
};

const addTodo = function(req, res) {
  const {title, taskNames} = JSON.parse(req.body);
  const todoId = '' + getTodoId();
  const tasks = taskNames.map((taskName, index) => {
    return {name: taskName, id: `${todoId}-${index}`, done: false};
  });
  const todo = new Todo(title, todoId, tasks);
  TODO_LIST.unshift(todo);
  saveTodoList();
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todo));
};

const toggleTask = function(req, res){
  const {todoId, taskId} = JSON.parse(req.body);
  const todo = getTodoById(todoId);
  todo.toggleTaskStatus(taskId);
  saveTodoList();
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
app.get(serveTodoList, '/records');
app.post(addTodo, '/saveTodo');
app.post(toggleTask, '/toggleTask');
app.use(getNotFoundResponse);

module.exports = {app};
