const TodoList = require('./todoList');

class TodoListCollection {
  constructor(todos){
    this.todoLists = todos.slice();
  }

  getNewTodoId(){
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

  addTodoList(todoList) {
    this.todoLists.unshift(todoList);
  }
}

const generateTodoList = function(list){
  const todoLists = list.map(todoList => {
    const {title, id, tasks} = todoList;
    return new TodoList(title, id, tasks);
  });
  return new TodoListCollection(todoLists);
};

const addTodoListToCollection = function(todoLists, title, taskNames){
  const todoId = todoLists.getNewTodoId();
  const tasks = taskNames.map((taskName, index) => {
    return {name: taskName, id: `${todoId}-${index}`, done: false};
  });
  const todo = new TodoList(title, todoId, tasks);
  todoLists.addTodoList(todo);
  return JSON.stringify(todo);
};

module.exports = {generateTodoList, addTodoListToCollection};
