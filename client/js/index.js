(() => {      
  const model = {
    init: () => {}
  };

  const view = {
    init: function() {
      const loginDiv = document.getElementById('login-div');
      const chatDiv = document.getElementById('chat-div');
      const loginForm = document.getElementById('login-form');
      const loginInput = document.getElementById('nickname');
      const chatForm = document.getElementById('chat-form');
      const chatInput = document.getElementById('m');
      this.messages = document.getElementById('messages');
      this.onlineListElm = document.getElementById('online-list');
    
      return { loginDiv, chatDiv, loginForm, loginInput, chatForm, chatInput };    
    },

    renderOnlineList: function(list) {
      this.onlineListElm.innerHTML = '';
    
      list.forEach(user => {
        let li = document.createElement('li');
        li.innerText = user;
    
        this.onlineListElm.appendChild(li);
      });
    },

    unrenderTypingNotification: function(nickname) {
      const typingNotification = document.getElementById(`${nickname}-typing`);
    
      typingNotification.parentNode.removeChild(typingNotification);
    },

    renderNotification: function(message, className) {
      const li = document.createElement('li');
      li.setAttribute('class', className);
      li.innerText = message;
     
      this.messages.appendChild(li);
      let notificationTimeout = setTimeout(() => {
        this.messages.removeChild(li);
        clearTimeout(notificationTimeout);
      }, 2000);
    },

    renderTypingNotification: function(nickname) {
      const typingMessage = document.getElementById(`${nickname}-typing`);
      
      if (!typingMessage) {
        const li = document.createElement('li');
        li.setAttribute('class', 'typing-notification');
        li.setAttribute('id', `${nickname}-typing`);
        li.innerText = `${nickname} is typing...`;
    
        this.messages.appendChild(li);
      }
    },

    renderMessage: function(msg, nickname) {
      let b = document.createElement('b');
      b.innerText = nickname + ': ';
    
      let span = document.createElement('span');
      span.innerText = msg;
    
      let li = document.createElement('li');
      li.appendChild(b);
      li.appendChild(span);
    
      this.messages.appendChild(li);
    }
  };

  const octopus = {};

  const login = () => {
    // update dom
    // call engine()
  
    const { loginForm, loginInput, loginDiv, chatDiv } = view.init();
  
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      loginForm.removeEventListener('submit', () => {});
  
      loginDiv.style.display = 'none';
      engine(loginInput.value);
      chatDiv.style.display = 'flex';
    });
  };
  
  const engine = nickname => {
    const onlineList = new OnlineList();
    let socket = io();
    const { chatForm, chatInput } = view.init();
  
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      view.renderMessage(chatInput.value, nickname);
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
      view.renderOnlineList(list);
    });
  
    socket.on('chat message', (msg, nickname) => {
      view.renderMessage(msg, nickname);
    });
  
    socket.on('new user', () => {
      view.renderNotification('new user joined', 'new-user-notification');
    });
  
    socket.on('user disconnected', () => {
      view.renderNotification('user disconnected', 'user-disconnected-notification');
    });
  
    socket.on('user typing', nickname => {
      view.renderTypingNotification(nickname);
    });
  
    socket.on('typing end', nickname => {
      view.unrenderTypingNotification(nickname);
    });
  }
  
  login();
})();