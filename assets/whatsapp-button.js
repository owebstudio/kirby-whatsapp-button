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
      isList: "is-list",
      hasAgents: "has-agents",
      isOffline: "is-offline",
      toggleButton: "wb-toggle-button",
      toggleBadge: "wb-unread-badge",
      chatScreen: "wb-chat",
      chatHeader: "wb-chat-header",
      backButton: "wb-back-button",
      userObject: "wb-user-object",
      userAvatar: "wb-user-avatar",
      userInitials: "wb-user-initials",
      userBody: "wb-user-body",
      userName: "wb-user-name",
      userStatus: "wb-user-status",
      chatBody: "wb-chat-body",
      messageList: "wb-message-list",
      messageListItem: "wb-message-list-item",
      agentList: "wb-agent-list",
      agentButton: "wb-agent",
      agentBody: "wb-agent-body",
      agentName: "wb-agent-name",
      agentStatus: "wb-agent-status",
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
      backLabel: "Back",
      phone: "",
      agents: [],
      hours: [],
      timezone: null,
      outsideHours: "offline",
      offlineStatus: "offline",
      offlineMessages: "We are away right now. Leave us a message and we will get back to you as soon as we can.",
    },
    init: function () {
      // Introduce defaults that can be extended either
      // globally or using an object literal.
      this.config = this.extend({}, this.defaults, this.options);

      // Without a list of agents, the options are the only agent.
      this.agents = this.config.agents.length > 0 ? this.config.agents : [this.config];

      // Check the office hours of every agent
      this.agents.forEach(function (agent) {
        agent.online = this.isAvailable(agent.hours);
      }, this);

      if (this.config.outsideHours === "hide") {
        this.agents = this.agents.filter(function (agent) {
          return agent.online;
        });

        if (this.agents.length === 0) {
          return this;
        }
      }

      this.online = this.agents.some(function (agent) {
        return agent.online;
      });

      this.elm.classList.add(this.classes.base);

      if (!this.online) {
        this.elm.classList.add(this.classes.isOffline);
      }

      if (this.agents.length > 1) {
        this.elm.classList.add(this.classes.hasAgents);
      }

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
    isAvailable: function (hours) {
      if (!hours || hours.length === 0) {
        return true;
      }

      let now = this.now();

      return hours.some(function (range) {
        return range[0] === now.day && now.minutes >= range[1] && now.minutes < range[2];
      });
    },
    // The day of the week (1 to 7 from Monday) and the minutes
    // since midnight in the time zone of the office hours
    now: function () {
      let date = new Date();
      let parts = {};

      try {
        new Intl.DateTimeFormat("en-US", {
          timeZone: this.config.timezone || undefined,
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
          hourCycle: "h23",
        })
          .formatToParts(date)
          .forEach(function (part) {
            parts[part.type] = part.value;
          });
      } catch (e) {
        return { day: date.getDay() || 7, minutes: date.getHours() * 60 + date.getMinutes() };
      }

      return {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) + 1,
        minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
      };
    },
    status: function (person) {
      if (person.online === false) {
        return this.config.offlineStatus;
      }

      return person.status || this.config.status;
    },
    avatar: function (person) {
      // An image, or the initials of the name without an avatar
      let $avatar;

      if (person.avatar) {
        $avatar = document.createElement("img");
        $avatar.setAttribute("src", person.avatar);
        $avatar.setAttribute("alt", "");
      } else {
        $avatar = document.createElement("span");
        $avatar.classList.add(this.classes.userInitials);
        $avatar.setAttribute("aria-hidden", "true");
        $avatar.textContent = this.initials(person.name);
      }

      $avatar.classList.add(this.classes.userAvatar);

      return $avatar;
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

      // Append Back Button to the list of agents
      let $backButton = document.createElement("button");
      $backButton.classList.add(self.classes.backButton);
      $backButton.setAttribute("type", "button");
      $backButton.setAttribute("aria-label", self.config.backLabel);
      $chatHeader.appendChild($backButton);

      // Append User Object
      let $userObject = document.createElement("div");
      $userObject.classList.add(self.classes.userObject);
      $chatHeader.appendChild($userObject);

      // Append User Body
      let $userBody = document.createElement("div");
      $userBody.classList.add(self.classes.userBody);
      $chatHeader.appendChild($userBody);

      // Append User Name
      let $userName = document.createElement("strong");
      $userName.className = self.classes.userName;
      $userBody.appendChild($userName);

      // Append User Status
      let $userStatus = document.createElement("small");
      $userStatus.className = self.classes.userStatus;

      if (self.config.showStatus) {
        $userBody.appendChild($userStatus);
      }

      self.chat = $chat;
      self.header = { avatar: $userObject, name: $userName, status: $userStatus };

      // Append Dialog Screen Body
      let $chatBody = document.createElement("div");
      $chatBody.classList.add(self.classes.chatBody);
      $chat.appendChild($chatBody);

      // Append Messages List
      let $messageList = document.createElement("ul");
      $messageList.classList.add(self.classes.messageList);
      $chatBody.appendChild($messageList);

      // Append Messages, or the messages for outside of the office hours
      let messages = self.online ? self.config.messages : self.config.offlineMessages;

      if (typeof messages === "object") {
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
        item.textContent = messages;
        $messageList.appendChild(item);
      }

      // Append Agents List
      let $agentList = document.createElement("ul");
      $agentList.classList.add(self.classes.agentList);
      $chatBody.appendChild($agentList);

      if (self.agents.length > 1) {
        self.agents.forEach(function (agent) {
          let $agentItem = document.createElement("li");
          let $agentButton = document.createElement("button");
          $agentButton.classList.add(self.classes.agentButton);
          $agentButton.setAttribute("type", "button");
          $agentButton.appendChild(self.avatar(agent));

          let $agentBody = document.createElement("span");
          $agentBody.classList.add(self.classes.agentBody);
          $agentButton.appendChild($agentBody);

          let $agentName = document.createElement("span");
          $agentName.classList.add(self.classes.agentName);
          $agentName.textContent = agent.name;
          $agentBody.appendChild($agentName);

          if (self.config.showStatus && (agent.status || !agent.online)) {
            let $agentStatus = document.createElement("span");
            $agentStatus.classList.add(self.classes.agentStatus);
            $agentStatus.textContent = self.status(agent);
            $agentBody.appendChild($agentStatus);
          }

          if (!agent.online) {
            $agentButton.classList.add(self.classes.isOffline);
          }

          $agentButton.addEventListener("click", function () {
            self.selectAgent(agent);
            $messageInput.focus();
          });

          $agentItem.appendChild($agentButton);
          $agentList.appendChild($agentItem);
        });
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

      // Go back to the list of agents.
      $backButton.addEventListener("click", function () {
        self.showAgents();
        $agentList.querySelector("button").focus();
      });

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

        window.open(self.link(self.agent.phone, messageContent), "_blank", "noopener");
      });

      if (self.agents.length > 1) {
        self.showAgents();
      } else {
        self.selectAgent(self.agents[0]);
      }
    },
    setHeader: function (person) {
      this.header.avatar.replaceChildren(this.avatar(person));
      this.header.name.textContent = person.name;
      this.header.status.textContent = this.status(person);
      this.chat.setAttribute("aria-label", person.name);
    },
    showAgents: function () {
      this.agent = null;
      this.chat.classList.add(this.classes.isList);
      this.setHeader({ name: this.config.name, avatar: this.config.avatar, online: this.online });
    },
    selectAgent: function (agent) {
      this.agent = agent;
      this.chat.classList.remove(this.classes.isList);
      this.setHeader(agent);
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
