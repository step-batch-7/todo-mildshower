const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
  'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'];

class Todo {
  constructor(title, tasks){
    this.title = title;
    this.tasks = [...tasks];
    this.time = new Date();
  }

  toHtml() {
    const tasksHtml = this.tasks.map(task => `<p>${task}</p>`).join('\n');
    const day = DAYS[this.time.getDay()];
    const month = MONTHS[this.time.getMonth()];
    const date = this.time.getDate();
    const year = this.time.getFullYear();
    const time = `${day}, ${date} ${month}, ${year}`;
    return `
    <div class="todoBox">
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
}
