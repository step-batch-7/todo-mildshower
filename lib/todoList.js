class Todo{
  constructor(title, id, tasks){
    this.title = title;
    this.id = id;
    this.tasks = tasks.slice();
  }

  toggleTaskStatus(taskId){
    const selectedTask = this.tasks.find(task => task.isIdSame(taskId));
    selectedTask.toggleStatus();
  }

  isIdSame(id){
    return this.id === id;
  }
}

module.exports = Todo;
