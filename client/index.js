const getDom = () => {
  const loginDiv = document.getElementById('login-div');
  const chatDiv = document.getElementById('chat-div');
  const loginForm = document.getElementById('login-form');
  const loginInput = document.getElementById('nickname');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('m');
  const messages = document.getElementById('messages');

  return { loginDiv, chatDiv, loginForm, loginInput, chatForm, chatInput, messages };
}

const login = () => {
  // update dom
  // call setMessaging()

  const { loginForm, loginInput, loginDiv, chatDiv } = getDom();

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    loginForm.removeEventListener('submit', () => {});

    loginDiv.style.display = 'none';
    setMessaging(loginInput.value);
    chatDiv.style.display = 'inherit';
  });
};

const setMessaging = nickname => {
  let socket = io();
  const { chatForm, chatInput, messages } = getDom();

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    appendMessage(messages, chatInput.value, nickname);
    socket.emit('chat message', chatInput.value, nickname);
    chatInput.value = '';
    return;
  });

  socket.on('chat message', (msg, nickname) => {
    appendMessage(messages, msg, nickname);
  });

  socket.on('new user', () => {
    showNotification(messages, 'new user joined', 'new-user-notification');
  });

  socket.on('user disconnected', () => {
    showNotification(messages, 'user disconnected', 'user-disconnected-notification');
  });
}

const appendMessage = (messages, msg, nickname) => {
  let b = document.createElement('b');
  b.innerText = nickname + ': ';

  let span = document.createElement('span');
  span.innerText = msg;

  let li = document.createElement('li');
  li.appendChild(b);
  li.appendChild(span);

  messages.appendChild(li);
};

const showNotification = (parentNode, message, className) => {
  const li = document.createElement('li');
  li.setAttribute('class', className);
  li.innerText = message;
 
  parentNode.appendChild(li);
  let notificationTimeout = setTimeout(() => {
    parentNode.removeChild(li);
    clearTimeout(notificationTimeout);
  }, 2000);
};

(() => {      
  login();
})();

