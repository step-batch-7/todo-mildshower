const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const TodoListCollection = require('./todoListCollection');
const SessionManager = require('./sessionManager');
const CONTENT_TYPES = require('./contentTypes.json');
const {TODO_STORE_PATH} = require('../config');
const userDetails = require('../data/users');
const TODO_LISTS = TodoListCollection.load(require(TODO_STORE_PATH));
const sessions = new SessionManager();

const todoListsDataWriter = writeFileSync.bind(null, TODO_STORE_PATH);

const isExistingFile = function(filePath) {
  return existsSync(filePath) && statSync(filePath).isFile();
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

const getStaticFileResponse = function(req, res, next) {
  const path = req.path === '/' ? '/index.html' : req.path;
  const filePath = `public${path}`;

  if (!isExistingFile(filePath)) {
    return next();
  }

  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(readFileSync(filePath));
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
    if(req.headers['content-type'] === 'application/json'){
      req.body = JSON.parse(body);
    }
    next();
  });
};

const login = function(req, res) {
  const {userName, password} = req.body;
  res.statusCode = 302;
  if(userDetails[userName] && userDetails[userName].password === password){
    res.setHeader('location', 'index.html');
    res.setHeader('Set-Cookie', `_SID=${sessions.createSession(userName)}`);
  }else{
    res.setHeader('location', 'login.html?retry=true');
  }
  res.end();
};

const verifyUser = function(req, res, next){
  if(sessions.isValidSessionId(req.cookies._SID)) {
    return next();
  }
  res.statusCode = 302;
  res.setHeader('location', 'login.html');
  res.end();
};

const serveLoginPage = function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  let alert = '';
  req.query.retry && (alert = '<p>Entered Username or Password is wrong or does not match</p>');
  const loginPage = fillTemplate('login.html', {alert});
  res.end(loginPage);
};

const serveTodoLists = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(TODO_LISTS));
};

const addTodoList = function(req, res) {
  const {title} = req.body;
  const newTodoListId = TODO_LISTS.addTodoList(title);
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  TODO_LISTS.save(todoListsDataWriter);
  res.end(JSON.stringify({newTodoListId}));
};

const toggleTaskState = function(req, res){
  const {todoListId, taskId} = req.body;
  TODO_LISTS.toggleTaskState(todoListId, taskId);
  TODO_LISTS.save(todoListsDataWriter);
  res.end();
};

const deleteTask = function(req, res){
  const {todoListId, taskId} = req.body;
  TODO_LISTS.deleteTask(todoListId, taskId);
  TODO_LISTS.save(todoListsDataWriter);
  res.end();
};

const deleteTodoList = function(req, res){
  const {todoListId} = req.body;
  TODO_LISTS.deleteTodoList(todoListId);
  TODO_LISTS.save(todoListsDataWriter);
  res.end();
};

const addTaskToTodo = function(req, res) {
  const {todoListId, taskName} = req.body;
  const taskId = TODO_LISTS.addTask(todoListId, taskName);
  TODO_LISTS.save(todoListsDataWriter);
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({id: taskId}));
};

const modifyTodoTitle = function(req, res){
  const {todoListId, title} = req.body;
  TODO_LISTS.modifyTodoTitle(todoListId, title);
  TODO_LISTS.save(todoListsDataWriter);
  res.end();
};

const modifyTaskName = function(req, res){
  const {todoListId, taskId, name} = req.body;
  TODO_LISTS.modifyTaskName(todoListId, taskId, name);
  TODO_LISTS.save(todoListsDataWriter);
  res.end();
};

const getNotFoundResponse = function(req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.statusMessage = 'NOT FOUND';
  res.end(fillTemplate('notFound.html', {path: req.url}));
};

const app = new App();

app.use(receiveBody);
app.get(serveLoginPage, '/login.html');
app.get(verifyUser, '/index.html');
app.get(verifyUser, '/');
app.get(getStaticFileResponse);
app.get(serveTodoLists, '/records');
app.post(login, '/login');
app.post(deleteTodoList, '/deleteTodo');
app.post(addTodoList, '/addTodoList');
app.post(deleteTask, '/deleteTask');
app.post(toggleTaskState, '/toggleTaskState');
app.post(addTaskToTodo, '/addTask');
app.post(modifyTodoTitle, '/modifyTodoTitle');
app.post(modifyTaskName, '/modifyTaskName');
app.use(getNotFoundResponse);

module.exports = {app};
