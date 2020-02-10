const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const App = require('./app');
const TodoListCollection = require('./todoListCollection');
const SessionManager = require('./sessionManager');
const bodyReceiver = require('./bodyReceiver');
const fillTemplate = require('./templateFiller');
const CONTENT_TYPES = require('./contentTypes.json');
const {TODO_STORE_PATH, USERS_DETAILS_PATH} = require('../config');
const userDetails = require(USERS_DETAILS_PATH);
const sessions = new SessionManager();

const loadPreviousRecords = recordsObj =>
  Object.entries(recordsObj).reduce((records, [userName, todoLists]) => {
    records[userName] = TodoListCollection.load(todoLists);
    return records;
  }, {});

const allUsersTodoLists = loadPreviousRecords(require(TODO_STORE_PATH));

const saveAllTodoLists = () =>
  writeFileSync(TODO_STORE_PATH, JSON.stringify(allUsersTodoLists, null, 2));

const saveUsersData = () =>
  writeFileSync(USERS_DETAILS_PATH, JSON.stringify(userDetails, null, 2));

const getUserTodoLists = userName => allUsersTodoLists[userName];

const getUserTodosBySessionId = function(sessionId) {
  const session = sessions.getSession(sessionId);
  return session && getUserTodoLists(session.userName);
};

const redirect = function(res, location) {
  res.statusCode = 302;
  res.setHeader('location', location);
  res.end();
};

const sendData = function(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const isExistingFile = function(filePath) {
  return existsSync(filePath) && statSync(filePath).isFile();
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

const validateUserName = function(req, res) {
  const {entered} = req.body;
  const isUniq = !Object.keys(userDetails).includes(entered);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({isUniq}));
};

const registerNewUser = function(req, res) {
  const {name, password, userName} = req.body;
  userDetails[userName] = {name, password};
  allUsersTodoLists[userName] = new TodoListCollection([]);
  saveAllTodoLists();
  saveUsersData();
  redirect(res, 'login.html');
};

const login = function(req, res) {
  const {userName, password} = req.body;
  if(userDetails[userName] && userDetails[userName].password === password){
    res.setHeader('Set-Cookie', `_SID=${sessions.createSession(userName)}`);
    redirect(res, 'index.html');
    return;
  }
  redirect(res, 'login.html?retry=true');
};

const verifyUserForPageAccess = function(req, res, next){
  if(sessions.isValidSessionId(req.cookies._SID)) {
    return next();
  }
  redirect(res, 'login.html');
};

const serveLoginPage = function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  const alert = req.query.retry ? '<p>Incorrect Username or Password</p>' : '';
  res.end(fillTemplate('login.html', {alert}));
};

const serveTodoLists = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(userTodoLists));
};

const addTodoList = function(req, res) {
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  const newTodoListId = userTodoLists.addTodoList(req.body.title);
  res.statusCode = 201;
  saveAllTodoLists();
  sendData(res, {newTodoListId});
};

const toggleTaskState = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  userTodoLists.toggleTaskState(req.body.todoListId, req.body.taskId);
  saveAllTodoLists();
  res.end();
};

const deleteTask = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  userTodoLists.deleteTask(req.body.todoListId, req.body.taskId);
  saveAllTodoLists();
  res.end();
};

const deleteTodoList = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  userTodoLists.deleteTodoList(req.body.todoListId);
  saveAllTodoLists();
  res.end();
};

const addTaskToTodo = function(req, res) {
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  const taskId = userTodoLists.addTask(req.body.todoListId, req.body.taskName);
  saveAllTodoLists();
  res.statusCode = 201;
  sendData(res, {id: taskId});
};

const modifyTodoTitle = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  userTodoLists.modifyTodoTitle(req.body.todoListId, req.body.title);
  saveAllTodoLists();
  res.end();
};

const modifyTaskName = function(req, res){
  const userTodoLists = getUserTodosBySessionId(req.cookies._SID);
  const {todoListId, taskId, name} = req.body;
  userTodoLists.modifyTaskName(todoListId, taskId, name);
  saveAllTodoLists();
  res.end();
};

const getNotFoundResponse = function(req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.statusMessage = 'NOT FOUND';
  res.end(fillTemplate('notFound.html', {path: req.url}));
};

const app = new App();

app.use(bodyReceiver);
app.get(serveLoginPage, '/login.html');
app.get(verifyUserForPageAccess, '/index.html');
app.get(verifyUserForPageAccess, '/');
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
