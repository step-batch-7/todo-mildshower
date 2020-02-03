const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
  'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'];

class Todo {
  constructor(title, tasks, time, id){
    this.title = title;
    this.tasks = [...tasks];
    this.time = time;
    this.id = id;
  }

  toHtml() {
    const tasksHtml = this.tasks.map(task => `
    <div class="taskItem">
      <div class="tickBox"></div>
      <p>${task.message}</p>
    </div>`).join('\n');

    const day = DAYS[this.time.getDay()];
    const month = MONTHS[this.time.getMonth()];
    const date = this.time.getDate();
    const year = this.time.getFullYear();
    const time = `${day}, ${date} ${month}, ${year}`;

    return `
    <div class="todoBox" id="${this.id}">
      <div class="todoHeader">
        <h3>${this.title}</h3>
        <div class="infoStrap">
          <span class="time">${time}</span>
          <span class="taskCount">${this.tasks.length} left<span>
        </div>
      </div>
      <div class="tasks">
        ${tasksHtml}
      </div>
    </div>`;
  }

  static from(parsedObject){
    const {title, tasks, time} = parsedObject;
    const taskObjects = tasks.map(task => ({done: false, message: task}));
    return new Todo(title, taskObjects, new Date(time), time);
  }
}

module.exports = Todo;
