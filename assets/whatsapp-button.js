(function () {
  if (window.WhatsappButton) {
    window.WhatsappButton.initAll();
    return;
  }

  let WhatsappButton = function (elm, options) {
    this.elm = typeof elm === "string" ? document.getElementById(elm) : elm;
    this.options = options;
  };

  WhatsappButton.prototype = {
    classes: {
      base: "whatsappButton",
      position: "is-right",
      isOpen: "is-open",
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
      buttonLabel: "Chat on WhatsApp",
      sendLabel: "Send",
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
    // The session storage remembers for the current tab
    // that the chat screen was already opened automatically.
    wasShown: function () {
      try {
        return window.sessionStorage.getItem("whatsappButtonShown") === "true";
      } catch (e) {
        return false;
      }
    },
    setShown: function () {
      try {
        window.sessionStorage.setItem("whatsappButtonShown", "true");
      } catch (e) {
        // storage is not available
      }
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
    link: function (phone, message) {
      // wa.me expects the number in international format with digits only
      return "https://wa.me/" + String(phone).replace(/\D/g, "") + "?text=" + encodeURIComponent(message);
    },
    render: function () {
      let self = this;

      // Append Toggle Button
      let $toggleButton = document.createElement("button");
      $toggleButton.classList.add(self.classes.toggleButton);
      $toggleButton.setAttribute("type", "button");
      $toggleButton.setAttribute("aria-label", self.config.buttonLabel);
      $toggleButton.setAttribute("aria-expanded", "false");
      self.elm.appendChild($toggleButton);
      self.toggleButton = $toggleButton;

      // Check if the badge will show
      if (self.config.showBadge) {
        // Append Unread Messages Badge
        let $toggleBadge = document.createElement("span");
        $toggleBadge.className = self.classes.toggleBadge;
        $toggleBadge.textContent = self.config.countBadge;
        $toggleBadge.setAttribute("aria-hidden", "true");
        $toggleButton.appendChild($toggleBadge);

        setTimeout(function () {
          $toggleBadge.style.display = "block";
        }, self.config.timeoutBadge);
      }

      // Append Chat Screen
      let $chat = document.createElement("div");
      $chat.classList.add(self.classes.chatScreen);
      $chat.setAttribute("role", "dialog");
      $chat.setAttribute("aria-label", self.config.name);
      self.elm.appendChild($chat);

      // Check if the chat screen will always be shown.
      if (self.config.alwaysOpen) {
        setTimeout(function () {
          self.open();
        }, self.config.alwaysOpenTimeout);
      } else if (self.config.autoOpen && (!self.config.doNotDisturb || !self.wasShown())) {
        // Open the chat screen automatically, only once per session in do not disturb mode
        setTimeout(function () {
          if (!self.isOpen()) {
            self.open();
            self.setShown();
          }
        }, self.config.autoOpenTimeout);
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
      let $chatFooter = document.createElement("form");
      $chatFooter.classList.add(self.classes.chatFooter);
      $chat.appendChild($chatFooter);

      // Append Message Input
      let $messageInput = document.createElement("input");
      $messageInput.classList.add(self.classes.messageInput);
      $messageInput.setAttribute("type", "text");
      $messageInput.setAttribute("placeholder", self.config.placeholder);
      $messageInput.setAttribute("aria-label", self.config.placeholder);
      $chatFooter.appendChild($messageInput);

      // Append Submit Button
      let $submitButton = document.createElement("button");
      $submitButton.classList.add(self.classes.submitButton);
      $submitButton.setAttribute("type", "submit");
      $submitButton.setAttribute("aria-label", self.config.sendLabel);
      $chatFooter.appendChild($submitButton);

      // Show the chat screen when the toggle button is clicked.
      $toggleButton.addEventListener("click", function () {
        self.toggle();
      });

      // Close the chat screen with the escape key.
      self.elm.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && self.isOpen()) {
          self.close();
          $toggleButton.focus();
        }
      });

      // When the form is submitted, forward the message to WhatsApp.
      $chatFooter.addEventListener("submit", function (event) {
        event.preventDefault();

        let messageContent = $messageInput.value.trim();

        if (messageContent.length === 0) {
          messageContent = self.config.defaultMessage;
        }

        window.open(self.link(self.config.phone, messageContent), "_blank", "noopener");
      });
    },
    isOpen: function () {
      return this.elm.classList.contains(this.classes.isOpen);
    },
    open: function () {
      this.elm.classList.add(this.classes.isOpen);
      this.toggleButton.setAttribute("aria-expanded", "true");
    },
    close: function () {
      this.elm.classList.remove(this.classes.isOpen);
      this.toggleButton.setAttribute("aria-expanded", "false");
    },
    toggle: function () {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },
  };

  WhatsappButton.defaults = WhatsappButton.prototype.defaults;

  // Initialize all widgets of the snippet once
  WhatsappButton.initAll = function () {
    document.querySelectorAll("[data-whatsapp-button]").forEach(function (elm) {
      if (elm.whatsappButton) {
        return;
      }

      elm.whatsappButton = new WhatsappButton(elm, JSON.parse(elm.getAttribute("data-whatsapp-button"))).init();
    });
  };

  window.WhatsappButton = WhatsappButton;

  WhatsappButton.initAll();
})();
