// const Task = require('./task');
const TodoList = require('./todoList');

class TodoListCollection {
  constructor(todolists){
    this.todoLists = todolists.slice();
  }

  getNewTodoListId(){
    return '' + (this.todoLists[0] ? +this.todoLists[0].id + 1 : 0);
  }

  save(writer){
    writer(JSON.stringify(this.todoLists, null, 2));
  }

  toJSON(){
    return this.todoLists;
  }

  getTodoById(todoId){
    return this.todoLists.find(todo => todo.isIdSame(todoId));
  }

  toggleTaskState(todoListId, taskId){
    const todoList = this.getTodoById(todoListId);
    todoList.toggleTaskState(taskId);
  }

  addTodoList(title) {
    const newTodoListId = this.getNewTodoListId();
    const todoList = new TodoList(title, newTodoListId, []);
    this.todoLists.unshift(todoList);
    return newTodoListId;
  }

  deleteTask(todoListId, taskId) {
    const todoList = this.getTodoById(todoListId);
    todoList.deleteTask(taskId);
  }

  addTask(todoListId, taskName){
    const todoList = this.getTodoById(todoListId);
    return todoList.addTask(taskName);
  }

  deleteTodoList(todoListId) {
    const index = this.todoLists.findIndex(todo => todo.id === todoListId);
    this.todoLists.splice(index, 1);
  }

  modifyTodoTitle(todoListId, title){
    const todoList = this.getTodoById(todoListId);
    todoList.modifyTitle(title);
  }

  modifyTaskName(todoListId, taskId, name){
    this.getTodoById(todoListId).modifyTaskName(taskId, name);
  }

  static load(list) {
    const todoLists = list.map(TodoList.load);
    return new TodoListCollection(todoLists);
  }
}

module.exports = TodoListCollection;
