const createSessionId = function() {
  return (new Date().getTime() + Math.random()).toString().replace('.', '');
};

class SessionManager {
  constructor() {
    this.records = {};
  }

  createSession(userName) {
    const sessionId = createSessionId();
    this.records[sessionId] = {userName};
    return sessionId;
  }

  isValidSessionId(sessionId){
    return this.records[sessionId] !== undefined;
  }

  getSession(sessionId) {
    return this.records[sessionId];
  }
}

module.exports = SessionManager;
