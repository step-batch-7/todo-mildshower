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

  toJSONString(){
    return JSON.stringify(this.todoLists);
  }

  getTodoById(todoId){
    return this.todoLists.find(todo => todo.isIdSame(todoId));
  }

  toggleTaskStatus(todoListId, taskId){
    const todoList = this.getTodoById(todoListId);
    todoList.toggleTaskStatus(taskId);
  }

  addTodoList(title, taskNames) {
    const todoList = new TodoList(title, this.getNewTodoListId(), []);
    taskNames.forEach(taskName => todoList.addTask(taskName));
    this.todoLists.unshift(todoList);
    return JSON.stringify(todoList);
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

  static load(list) {
    const todoLists = list.map(TodoList.load);
    return new TodoListCollection(todoLists);
  }
}

module.exports = TodoListCollection;
