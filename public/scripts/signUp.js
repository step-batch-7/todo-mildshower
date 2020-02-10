/* eslint-disable no-undef */
const checkIfUserNameAvailable = function() {
  postDataToServer('/validateUserName', {entered: userNameField.value}, ({isUniq}) => {
    if(isUniq) {
      submitForm.onsubmit = () => true;
      warning.classList.add('hidden');
      return;
    }
    warning.classList.remove('hidden');
    submitForm.onsubmit = () => false;
  });
};

const attachListeners = function(){
  userNameField.onkeyup = checkIfUserNameAvailable;
  submitForm.onsubmit = () => false;
};

const mian = function() {
  attachListeners();
};

window.onload = mian;
