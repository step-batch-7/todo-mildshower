class Task {
  constructor(name, id, initialStatus){
    this.name = name;
    this.id = id;
    this.done = initialStatus;
  }

  isIdSame(id){
    return this.id === id;
  }

  toggleStatus(){
    this.done = !this.done;
  }
}

module.exports = Task;
