const {writeFileSync} = require('fs');

const request = require('supertest');
const {app} = require('../lib/handlers');

const sampleTodoRecords = [
  {
    'title': 'New Todo',
    'id': '0',
    'tasks': [
      {
        'name': 'new task 1',
        'id': '0_0',
        'done': false
      },
      {
        'name': 'new task 2',
        'id': '0_1',
        'done': true
      }
    ]
  }
];

describe('GET', function() {
  it('/records should give all saved todos in json', function(done) {
    request(app.serve.bind(app))
      .get('/records')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect(JSON.stringify(sampleTodoRecords), done);
  });

  it('/<validFilePath> should give the file path', function(done) {
    request(app.serve.bind(app))
      .get('/index.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect(/To-do/, done);
  });

  it('/<invalidFilePath> should give NotFound page with code 404', function(done) {
    request(app.serve.bind(app))
      .get('/invalidPath.html')
      .expect(404)
      .expect('Content-Type', 'text/html')
      .expect(/OOPS!/, done);
  });
});

describe('POST', function() {
  after(function(){
    writeFileSync('test/resources/todoList.json', JSON.stringify(sampleTodoRecords));
  });
  it('/deleteTodo should delete the todo of the id', function(done) {
    request(app.serve.bind(app))
      .post('/deleteTodo')
      .send({todoListId: '0'})
      .set('Accept', 'application/json')
      .expect(200, done);
  });

  it('/addTodo should add a todo of given name', function(done) {
    request(app.serve.bind(app))
      .post('/addTodoList')
      .send({title: 'New Todo'})
      .set('Accept', 'application/json')
      .expect('content-type', 'application/json')
      .expect(/{"newTodoListId":"[0-9]+"}/)
      .expect(201, done);
  });

  it('/addTask should add a task to todo', function(done) {
    request(app.serve.bind(app))
      .post('/addTask')
      .send({todoListId: '0', taskName: 'new Task'})
      .set('Accept', 'application/json')
      .expect('content-type', 'application/json')
      .expect(/{"taskId":"[0-9]+_[0-9]"}/)
      .expect(201, done);
  });

  it('/toggleTaskState should toggle specific task state', function(done) {
    request(app.serve.bind(app))
      .post('/toggleTaskState')
      .send({todoListId: '0', taskId: '0_0'})
      .set('Accept', 'application/json')
      .expect('')
      .expect(200, done);
  });

  it('/deleteTask delete a task from todo', function(done) {
    request(app.serve.bind(app))
      .post('/deleteTask')
      .send({todoListId: '0', taskId: '0_0'})
      .set('Accept', 'application/json')
      .expect('')
      .expect(200, done);
  });

  it('/<invalidFilePath> should give NotFound page with code 404', function(done) {
    request(app.serve.bind(app))
      .post('/invalidPath.html')
      .expect(404)
      .expect('Content-Type', 'text/html')
      .expect(/OOPS!/, done);
  });
});
