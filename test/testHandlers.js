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

describe('GET /records', function() {
  it('should give all saved todos in json', function(done) {
    request(app.serve.bind(app))
      .get('/records')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect(JSON.stringify(sampleTodoRecords), done);
  });
});

describe('POST /records', function() {
  afterEach(function(){
    writeFileSync('test/resources/todoList.json', JSON.stringify(sampleTodoRecords));
  });
  it('should give all saved todos in json', function(done) {
    request(app.serve.bind(app))
      .post('/deleteTodo')
      .send({todoListId: '0'})
      .set('Accept', 'application/json')
      .expect(200, done);
  });
});
