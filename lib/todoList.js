const Task = require('./task');

class TodoList{
  constructor(title, id, tasks){
    this.title = title;
    this.id = '' + id;
    this.tasks = tasks.slice();
  }

  getNewTaskId(){
    const lastAddedTask = this.tasks[this.tasks.length - 1];
    if(lastAddedTask){
      return +lastAddedTask.id.split('_').pop() + 1;
    }
    return 0;
  }

  addTask(taskName){
    const id = `${this.id}_${this.getNewTaskId()}`;
    this.tasks.push(new Task(taskName, id, false));
  }

  deleteTask(taskId){
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    this.tasks.splice(taskIndex, 1);
  }

  toggleTaskStatus(taskId){
    const selectedTask = this.tasks.find(task => task.isIdSame(taskId));
    selectedTask.toggleStatus();
  }

  isIdSame(id){
    return this.id === id;
  }

  static load(todoObj){
    const tasks = todoObj.tasks.map(Task.load);
    return new TodoList(todoObj.title, todoObj.id, tasks);
  }
}

module.exports = TodoList;
