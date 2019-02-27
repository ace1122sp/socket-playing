(() => {      
  const model = {
    init: function() {
      this.onlineList = new OnlineList();
    },
    
    update: function(list) {
      this.onlineList.update(list);
    }
  };

  const view = {
    init: function() {
      this.loginDiv = document.getElementById('login-div');
      this.chatDiv = document.getElementById('chat-div');
      this.loginForm = document.getElementById('login-form');
      this.loginInput = document.getElementById('nickname');
      this.chatForm = document.getElementById('chat-form');
      this.chatInput = document.getElementById('m');
      this.messages = document.getElementById('messages');
      this.onlineListElm = document.getElementById('online-list');
    },

    addLoginListener: function() {
      this.loginForm.addEventListener('submit', this._renderChatAndHideLogin);
    },

    _renderChatAndHideLogin: function(e) {
      e.preventDefault();      
      view.loginForm.removeEventListener('submit', this._renderChatAndHideLogin);
  
      view.loginDiv.style.display = 'none';
      octopus.setChat(view.loginInput.value);
      view.chatDiv.style.display = 'flex';
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
    },

    addMessageListeners: function(nickname) {
      this.setMessaging(nickname);
      this.setTyping(nickname);
    },

    setMessaging: function(nickname) {
      this.chatForm.addEventListener('submit', e => {
        e.preventDefault();
        view.renderMessage(this.chatInput.value, nickname);
        octopus.socket.emit('typing end', nickname);
        octopus.socket.emit('chat message', this.chatInput.value, nickname);
        this.chatInput.value = '';
        return;
      });
    },

    setTyping: function(nickname) {
      this.chatInput.addEventListener('input', e => {
        if (e.target.value.length) {      
          octopus.socket.emit('user typing', nickname);
        } else {
          octopus.socket.emit('typing end', nickname);
        }
        return;
      });
    }
  };

  const octopus = {
    init: function() {
      model.init();
      this.socket = io();
      
      // get init dom and set init listeners
      view.init();
      view.addLoginListener();
    },

    setChat: function(nickname) {      
      view.addMessageListeners(nickname);
    
      this.socket.emit('login', nickname);
    
      this.socket.on('online list', list => {
        model.update(list);
        view.renderOnlineList(list);
      });
    
      this.socket.on('chat message', (msg, nickname) => {
        view.renderMessage(msg, nickname);
      });
    
      this.socket.on('new user', () => {
        view.renderNotification('new user joined', 'new-user-notification');
      });
    
      this.socket.on('user disconnected', () => {
        view.renderNotification('user disconnected', 'user-disconnected-notification');
      });
    
      this.socket.on('user typing', nickname => {
        view.renderTypingNotification(nickname);
      });
    
      this.socket.on('typing end', nickname => {
        view.unrenderTypingNotification(nickname);
      });
    }
  };
  
  octopus.init();  
})();