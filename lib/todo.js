class Todo{
  constructor(title, id, tasks){
    this.title = title;
    this.id = id;
    this.tasks = tasks.slice();
  }

  toggleTaskStatus(taskId){
    const selectedTask = this.tasks.find(task => task.id === taskId);
    selectedTask.done = !selectedTask.done;
  }

  isIdSame(id){
    return this.id === id;
  }
}

module.exports = Todo;
