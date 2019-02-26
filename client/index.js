const getDom = () => {
  const loginDiv = document.getElementById('login-div');
  const chatDiv = document.getElementById('chat-div');
  const loginForm = document.getElementById('login-form');
  const loginInput = document.getElementById('nickname');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('m');
  const messages = document.getElementById('messages');
  const onlineListElm = document.getElementById('online-list');

  return { loginDiv, chatDiv, loginForm, loginInput, chatForm, chatInput, messages, onlineListElm };
}

const renderOnlineList = (onlineListElm, list) => {
  onlineListElm.innerHTML = '';

  list.forEach(user => {
    let li = document.createElement('li');
    li.innerText = user;

    onlineListElm.appendChild(li);
  });
}

const login = () => {
  // update dom
  // call engine()

  const { loginForm, loginInput, loginDiv, chatDiv } = getDom();

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    loginForm.removeEventListener('submit', () => {});

    loginDiv.style.display = 'none';
    engine(loginInput.value);
    chatDiv.style.display = 'inherit';
  });
};

const engine = nickname => {
  const onlineList = new OnlineList();
  let socket = io();
  const { chatForm, chatInput, messages, onlineListElm } = getDom();

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    appendMessage(messages, chatInput.value, nickname);
    socket.emit('typing end', nickname);
    socket.emit('chat message', chatInput.value, nickname);
    chatInput.value = '';
    return;
  });

  chatInput.addEventListener('input', e => {
    if (e.target.value.length) {      
      socket.emit('user typing', nickname);
    } else {
      socket.emit('typing end', nickname);
    }
    
    return;
  });

  socket.emit('login', nickname);

  socket.on('online list', list => {
    onlineList.update(list);
    renderOnlineList(onlineListElm, list);
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

  socket.on('user typing', nickname => {
    showTypingNotification(messages, nickname);
  });

  socket.on('typing end', nickname => {
    hideTypingNotification(nickname);
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

const showTypingNotification = (parentNode, nickname) => {
  const typingMessage = document.getElementById(`${nickname}-typing`);
  if (!typingMessage) {
    const li = document.createElement('li');
    li.setAttribute('class', 'typing-notification');
    li.setAttribute('id', `${nickname}-typing`);
    li.innerText = `${nickname} is typing...`;

    parentNode.appendChild(li);
  }
};

const hideTypingNotification = nickname => {
  const typingNotification = document.getElementById(`${nickname}-typing`);

  typingNotification.parentNode.removeChild(typingNotification);
}

(() => {      
  login();
})();

// ----- classes -----

class OnlineList {
  constructor() {
    this.online = [];
  }

  update(initList) {
    this.online = [...initList];
  }

  get list() {
    return this.online;
  }
};