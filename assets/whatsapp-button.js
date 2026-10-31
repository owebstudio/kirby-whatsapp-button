let WhatsappButton = function (id, options) {
  this.elm = document.getElementById(id);
  this.options = options;
};

WhatsappButton.prototype = {
  classes: {
    base: "whatsappButton",
    position: "is-right",
    isOpen: "is-open",
    isActive: "is-active",
    toggleButton: "wb-toggle-button",
    toggleBadge: "wb-unread-badge",
    chatScreen: "wb-chat",
    chatHeader: "wb-chat-header",
    userObject: "wb-user-object",
    userAvatar: "wb-user-avatar",
    userInitials: "wb-user-initials",
    userBody: "wb-user-body",
    userName: "wb-user-name",
    userStatus: "wb-user-status",
    chatBody: "wb-chat-body",
    messageList: "wb-message-list",
    messageListItem: "wb-message-list-item",
    chatFooter: "wb-chat-footer",
    messageInput: "wb-message-input",
    submitButton: "wb-send-button",
  },
  defaults: {
    position: "right",
    showBadge: true,
    countBadge: 1,
    timeoutBadge: 1500,
    alwaysOpen: false,
    alwaysOpenTimeout: 2500,
    autoOpen: true,
    autoOpenTimeout: 5000,
    doNotDisturb: false,
    name: "Customer support",
    avatar: null,
    status: "online",
    showStatus: true,
    messages: "Hello, how can we help you?",
    placeholder: "Type here...",
    defaultMessage: "Hello",
    phone: "",
  },
  init: function () {
    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.config = this.extend({}, this.defaults, this.options);

    this.elm.classList.add(this.classes.base);

    if (this.config.position === "left" || this.config.position === "right") {
      this.elm.classList.add("is-" + this.config.position);
    } else {
      this.elm.classList.add(this.classes.position);
    }

    this.render();

    return this;
  },
  extend: function (out) {
    out = out || {};

    for (let i = 1; i < arguments.length; i++) {
      let obj = arguments[i];

      if (!obj) continue;

      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            if (obj[key] instanceof Array) out[key] = obj[key].slice(0);
            else out[key] = this.extend(out[key], obj[key]);
          } else out[key] = obj[key];
        }
      }
    }

    return out;
  },
  setCookie: function (name, value, days) {
    let expires = "";

    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }

    return (document.cookie = name + "=" + (value || "") + expires + "; path=/");
  },
  getCookie: function (name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];

      while (c.charAt(0) === " ") {
        c = c.substring(1, c.length);
      }

      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }

    return null;
  },
  eraseCookie: function (name) {
    return (document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;");
  },
  initials: function (name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (word) {
        return Array.from(word)[0] || "";
      })
      .join("")
      .toUpperCase();
  },
  render: function () {
    let self = this;

    // Append Toggle Button
    let $toggleButton = document.createElement("div");
    $toggleButton.classList.add(self.classes.toggleButton);
    self.elm.appendChild($toggleButton);

    // Check if the badge will show
    if (self.config.showBadge) {
      // Append Unread Messages Badge
      let $toggleBadge = document.createElement("span");
      $toggleBadge.className = self.classes.toggleBadge;
      $toggleBadge.textContent = self.config.countBadge;
      $toggleButton.appendChild($toggleBadge);

      setTimeout(function () {
        document.querySelector("." + self.classes.toggleBadge).style.display = "block";
      }, self.config.timeoutBadge);
    }

    // Append Chat Screen
    let $chat = document.createElement("div");
    $chat.classList.add(self.classes.chatScreen);
    self.elm.appendChild($chat);

    // Check if the chat screen will always be shown.
    if (self.config.alwaysOpen && !self.elm.classList.contains(self.classes.isOpen)) {
      setTimeout(function () {
        self.elm.classList.add(self.classes.isOpen);
      }, self.config.alwaysOpenTimeout);

      self.setCookie("wbAlwaysOpen", "true");
    } else {
      self.eraseCookie("wbAlwaysOpen");

      // Check if do not disturb mode is turned on
      if (self.config.doNotDisturb) {
        if (self.getCookie("wbShownPopup") !== "true") {
          setTimeout(function () {
            self.elm.classList.toggle(self.classes.isActive);
          }, self.config.autoOpenTimeout);

          self.setCookie("wbShownPopup", "true");
        }
      } else {
        // Check if the chat screen will open automatically
        setTimeout(function () {
          if (self.config.autoOpen && !self.elm.classList.contains(self.classes.isActive)) {
            self.elm.classList.toggle(self.classes.isActive);
            self.setCookie("wbShownPopup", "true");
          }
        }, self.config.autoOpenTimeout);
      }
    }

    // Append Dialog Screen Header
    let $chatHeader = document.createElement("div");
    $chatHeader.classList.add(self.classes.chatHeader);
    $chat.appendChild($chatHeader);

    // Append User Object
    let $userObject = document.createElement("div");
    $userObject.classList.add(self.classes.userObject);
    $chatHeader.appendChild($userObject);

    // Append User Avatar, or the initials of the name without an avatar
    let $userAvatar;

    if (self.config.avatar) {
      $userAvatar = document.createElement("img");
      $userAvatar.setAttribute("src", self.config.avatar);
      $userAvatar.setAttribute("alt", "");
    } else {
      $userAvatar = document.createElement("span");
      $userAvatar.classList.add(self.classes.userInitials);
      $userAvatar.textContent = self.initials(self.config.name);
    }

    $userAvatar.classList.add(self.classes.userAvatar);
    $userObject.appendChild($userAvatar);

    // Append User Body
    let $userBody = document.createElement("div");
    $userBody.classList.add(self.classes.userBody);
    $chatHeader.appendChild($userBody);

    // Append User Name
    let $userName = document.createElement("strong");
    $userName.className = self.classes.userName;
    $userName.textContent = self.config.name;
    $userBody.appendChild($userName);

    // Append User Status
    if (self.config.showStatus) {
      let $userStatus = document.createElement("small");
      $userStatus.className = self.classes.userStatus;
      $userStatus.textContent = self.config.status;

      $userBody.appendChild($userStatus);
    }

    // Append Dialog Screen Body
    let $chatBody = document.createElement("div");
    $chatBody.classList.add(self.classes.chatBody);
    $chat.appendChild($chatBody);

    // Append Messages List
    let $messageList = document.createElement("ul");
    $messageList.classList.add(self.classes.messageList);
    $chatBody.appendChild($messageList);

    // Append Messages
    if (typeof self.config.messages === "object") {
      let messages = self.config.messages;

      messages.forEach(function (message, i) {
        setTimeout(function () {
          let item = document.createElement("li");
          item.className = self.classes.messageListItem;
          item.textContent = message;
          $messageList.appendChild(item);
        }, 2000 * i);
      });
    } else {
      let item = document.createElement("li");
      item.className = self.classes.messageListItem;
      item.textContent = self.config.messages;
      $messageList.appendChild(item);
    }

    // Append Dialog Screen Footer
    let $chatFooter = document.createElement("div");
    $chatFooter.classList.add(self.classes.chatFooter);
    $chat.appendChild($chatFooter);

    // Append Message Input
    let $messageInput = document.createElement("input");
    $messageInput.classList.add(self.classes.messageInput);
    $messageInput.setAttribute("type", "text");
    $messageInput.setAttribute("placeholder", self.config.placeholder);
    $chatFooter.appendChild($messageInput);

    // Append Submit Button
    let $submitButton = document.createElement("div");
    $submitButton.classList.add(self.classes.submitButton);
    $chatFooter.appendChild($submitButton);

    // Show the chat screen when the toggle button is clicked.
    $toggleButton.addEventListener("click", function () {
      if (self.elm.classList.contains(self.classes.isOpen)) {
        self.elm.classList.remove(self.classes.isOpen);
      } else {
        self.elm.classList.toggle(self.classes.isActive);
      }
    });

    // When the submit button is clicked, forward the message to WhatsApp.
    $submitButton.addEventListener(
      "click",
      function () {
        let messageInput = document.querySelector("." + self.classes.messageInput);
        let messageContent = messageInput.value;

        if (messageContent.length === 0) {
          messageContent = self.config.defaultMessage;
        }

        window.open(
          "https://api.whatsapp.com/send?phone=" + self.config.phone + "&text=" + encodeURI(messageContent)
        );
      },
      false
    );
  },
};

WhatsappButton.defaults = WhatsappButton.prototype.defaults;

window.WhatsappButton = WhatsappButton;
