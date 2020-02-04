const Todo = require('./todo');

class TodoListCollection {
  constructor(todos){
    this.todos = todos.slice();
  }

  getNewTodoId(){
    return '' + (this.todos[0] ? +this.todos[0].id + 1 : 0);
  }

  save(writer){
    writer(JSON.stringify(this.todos, null, 2));
  }

  toJSONString(){
    return JSON.stringify(this.todos);
  }

  getTodoById(todoId){
    return this.todos.find(todo => todo.isIdSame(todoId));
  }

  toggleTaskStatus(todoId, taskId){
    const todo = this.getTodoById(todoId);
    todo.toggleTaskStatus(taskId);
  }

  addTodo(todo) {
    this.todos.unshift(todo);
  }
}

const generateTodoList = function(list){
  const todos = list.map(todo => new Todo(todo.title, todo.id, todo.tasks));
  return new TodoListCollection(todos);
};

const addTodoToList = function(todoList, title, taskNames){
  const todoId = todoList.getNewTodoId();
  const tasks = taskNames.map((taskName, index) => {
    return {name: taskName, id: `${todoId}-${index}`, done: false};
  });
  const todo = new Todo(title, todoId, tasks);
  todoList.addTodo(todo);
  return JSON.stringify(todo);
};

module.exports = {generateTodoList, addTodoToList};
