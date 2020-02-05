class Task {
  constructor(name, id, initialStatus){
    this.name = name;
    this.id = id;
    this.done = initialStatus;
  }

  isIdSame(id){
    return this.id === id;
  }

  toggleState(){
    this.done = !this.done;
  }

  static load(taskObj){
    const {name, id, done} = taskObj;
    return new Task(name, id, done);
  }
}

module.exports = Task;
