const getDom = () => {
  const form = document.getElementsByTagName('form')[0];
  const input = document.getElementById('m');
  const messages = document.getElementById('messages');

  return { form, input, messages };
}

const setMessaging = () => {
  let socket = io();
  const { form, input, messages } = getDom();

  form.addEventListener('submit', e => {
    e.preventDefault();
    appendMessage(messages, input.value);
    socket.emit('chat message', input.value);
    input.value = '';
    return;
  });

  socket.on('chat message', msg => {
    appendMessage(messages, msg);
  });

  socket.on('new user', () => {
    showNotification(messages, 'new user joined', 'new-user-notification');
  });

  socket.on('user disconnected', () => {
    showNotification(messages, 'user disconnected', 'user-disconnected-notification');
  });
}

const appendMessage = (messages, msg) => {
  let li = document.createElement('li');
  li.innerText = msg;
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
  setMessaging();
})();

