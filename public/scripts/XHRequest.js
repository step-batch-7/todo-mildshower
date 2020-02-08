/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const requestToServer = function(method, targetPath, data, callBack) {
  const request = new XMLHttpRequest();
  request.open(method, targetPath);
  request.responseType = 'json';
  data && request.setRequestHeader('Content-Type', 'application/json');
  request.onload = function(){
    callBack && callBack(this.response, this.status);
  };
  request.send(data && JSON.stringify(data));
};

const getDataFromServer = function(targetPath, callBack) {
  requestToServer('GET', targetPath, undefined, callBack);
};
const postDataToServer = requestToServer.bind(null, 'POST');

const fetchSavedRecords = getDataFromServer.bind('/records');
