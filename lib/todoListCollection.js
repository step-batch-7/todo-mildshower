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

  toggleTaskStatus(todoId, taskId){
    const todo = this.getTodoById(todoId);
    todo.toggleTaskStatus(taskId);
  }

  addTodoList(title, taskNames) {
    const todoList = new TodoList(title, this.getNewTodoListId(), []);
    taskNames.forEach(taskName => todoList.addTask(taskName));
    this.todoLists.unshift(todoList);
    return JSON.stringify(todoList);
  }

  deleteTask(todoListId, taskId) {
    const todo = this.getTodoById(todoListId);
    todo.deleteTask(taskId);
  }

  static load(list) {
    const todoLists = list.map(TodoList.load);
    return new TodoListCollection(todoLists);
  }
}

module.exports = TodoListCollection;
