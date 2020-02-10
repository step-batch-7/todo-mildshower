const TodoList = require('./todoList');

class TodoListCollection {
  constructor(todolists){
    this.todoLists = todolists.slice();
  }

  getNewTodoListId(){
    return '' + (this.todoLists[0] ? +this.todoLists[0].id + 1 : 0);
  }

  toJSON(){
    return this.todoLists;
  }

  getTodoById(todoId){
    return this.todoLists.find(todo => todo.isIdSame(todoId));
  }
  
  addTodoList(title) {
    const newTodoListId = this.getNewTodoListId();
    const todoList = new TodoList(title, newTodoListId, []);
    this.todoLists.unshift(todoList);
    return newTodoListId;
  }
  
  deleteTodoList(todoListId) {
    const index = this.todoLists.findIndex(todo => todo.id === todoListId);
    this.todoLists.splice(index, 1);
  }

  modifyTodoTitle(todoListId, title){
    const todoList = this.getTodoById(todoListId);
    todoList.modifyTitle(title);
  }
  
  addTask(todoListId, taskName){
    const todoList = this.getTodoById(todoListId);
    return todoList.addTask(taskName);
  }
  
  toggleTaskState(todoListId, taskId){
    const todoList = this.getTodoById(todoListId);
    todoList.toggleTaskState(taskId);
  }

  deleteTask(todoListId, taskId) {
    const todoList = this.getTodoById(todoListId);
    todoList.deleteTask(taskId);
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
