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
});

describe('POST', function() {
  afterEach(function(){
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
});
