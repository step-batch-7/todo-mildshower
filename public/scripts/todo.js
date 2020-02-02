class Todo {
  constructor(title, tasks){
    this.title = title;
    this.tasks = [...tasks];
  }

  toHtml() {
    const tasksHtml = this.tasks.map(task => `<p>${task}</p>`).join('\n');
    return `
    <div class="todoBox">
      <h3>${this.title}</h3>
      <div class="tasks">
        ${tasksHtml}
      </div>
    </div>`;
  }
}
