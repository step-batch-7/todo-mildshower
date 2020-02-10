const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const TodoListCollection = require('./todoListCollection');
const SessionManager = require('./sessionManager');
const CONTENT_TYPES = require('./contentTypes.json');
const {TODO_STORE_PATH, USERS_DETAILS_PATH} = require('../config');
const userDetails = require(USERS_DETAILS_PATH);
const sessions = new SessionManager();
const todoListsDataWriter = writeFileSync.bind(null, TODO_STORE_PATH);

const loadPreviousRecords = function(recordsObj){
  const records = {};
  Object.entries(recordsObj).forEach(([userName, todoLists]) => {
    records[userName] = TodoListCollection.load(todoLists);
  });
  return records;
};

const usersTodoLists = loadPreviousRecords(require(TODO_STORE_PATH));

const getUserTodoList = userName => usersTodoLists[userName];

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

const validateUserName = function(req, res) {
  const {entered} = req.body;
  const isUniq = !Object.keys(userDetails).includes(entered);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({isUniq}));
};

const registerNewUser = function(req, res) {
  const {name, password, userName} = req.body;
  userDetails[userName] = {name, password};
  usersTodoLists[userName] = new TodoListCollection([]);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  writeFileSync(USERS_DETAILS_PATH, JSON.stringify(userDetails, null, 2));
  res.statusCode = 302;
  res.setHeader('location', 'login.html');
  res.end();
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
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(userTodoLists));
};

const addTodoList = function(req, res) {
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {title} = req.body;
  const newTodoListId = userTodoLists.addTodoList(title);
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.end(JSON.stringify({newTodoListId}));
};

const toggleTaskState = function(req, res){
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId, taskId} = req.body;
  userTodoLists.toggleTaskState(todoListId, taskId);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.end();
};

const deleteTask = function(req, res){
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId, taskId} = req.body;
  userTodoLists.deleteTask(todoListId, taskId);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.end();
};

const deleteTodoList = function(req, res){
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId} = req.body;
  userTodoLists.deleteTodoList(todoListId);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.end();
};

const addTaskToTodo = function(req, res) {
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId, taskName} = req.body;
  const taskId = userTodoLists.addTask(todoListId, taskName);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({id: taskId}));
};

const modifyTodoTitle = function(req, res){
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId, title} = req.body;
  userTodoLists.modifyTodoTitle(todoListId, title);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
  res.end();
};

const modifyTaskName = function(req, res){
  const userName = sessions.getSession(req.cookies._SID).userName;
  const userTodoLists = getUserTodoList(userName);
  const {todoListId, taskId, name} = req.body;
  userTodoLists.modifyTaskName(todoListId, taskId, name);
  writeFileSync(TODO_STORE_PATH, JSON.stringify(usersTodoLists, null, 2));
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
app.post(registerNewUser, '/signUp');
app.post(login, '/login');
app.post(validateUserName, '/validateUserName');
app.post(deleteTodoList, '/deleteTodo');
app.post(addTodoList, '/addTodoList');
app.post(deleteTask, '/deleteTask');
app.post(toggleTaskState, '/toggleTaskState');
app.post(addTaskToTodo, '/addTask');
app.post(modifyTodoTitle, '/modifyTodoTitle');
app.post(modifyTaskName, '/modifyTaskName');
app.use(getNotFoundResponse);

module.exports = {app};
