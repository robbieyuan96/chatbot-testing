// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/

var ConversationPanel = (function() {
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  };

  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown,
    resetConversation: resetConversation,
    resetCurrentChecklist: resetCurrentChecklist,
  };

  // Initialize the module
  function init() {
    chatUpdateSetup();
    Api.sendRequest('', null ); // Sending an empty message starts the bot greeting
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.watson);
    };
  }

  // Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {

  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    if (isUser !== null && textExists) {
      // Create new message DOM element
      var messages = buildMessageDomElements(newPayload, isUser);
      var chatBoxElement = document.querySelector(settings.selectors.chatBox);
      var previousLatest = chatBoxElement.querySelectorAll((isUser
        ? settings.selectors.fromUser : settings.selectors.fromWatson)
              + settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, function(element) {
          element.classList.remove('latest');
        });
      }

      // Clone the array and slowly shift elements off as we show them.
      var messagesCloned = messages.slice();
      function popAMessage() {
        var message = messagesCloned.shift();
        var pause = message.message.pause;
        var timeout = pause ? pause.time : 0;
        var typing = pause ? pause.typing : false;

        // Do the typing indicator if needed
        var typingBubble;
        if (typing) {
          typingBubble = document.createElement("div");
          typingBubble.className = "typing-bubble";
          chatBoxElement.appendChild(typingBubble);
          scrollToChatBottom();
        }

        // Also display typing text
        document.getElementById("typingInfo").style.opacity = typing ? 1.0 : 0.0;

        setTimeout(function() {
          // Remove the existing bubble
          if (typing) {
            typingBubble.parentElement.removeChild(typingBubble);
          }
          document.getElementById("typingInfo").style.opacity = 0;
          // Add the new message
          var messageElement = message.element;
          chatBoxElement.appendChild(messageElement);
          // Class to start fade in animation
          messageElement.classList.add('load');
          // Move chat to the most recent messages when new messages are added
          scrollToChatBottom();

          // Repeat for the next message
          if (messagesCloned.length > 0) {
            popAMessage();
          } else {
            ensureResetChecklistVisibility(newPayload);
          }
        }, timeout);
      }
      popAMessage();
    }
  }

  function ensureResetChecklistVisibility(payload) {
    var checklistButton = document.getElementById("resetChecklist");
    if (payload.context.current_checklist) {
      checklistButton.style.opacity = 1;
    } else {
      checklistButton.style.opacity = 0;
    }
  }

  // Checks if the given typeValue matches with the user "name", the Watson "name", or neither
  // Returns true if user, false if Watson, and null if neither
  // Used to keep track of whether a message was from the user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.watson) {
      return false;
    }
    return null;
  }

  // Constructs new DOM element from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var outputWithPauses;
    if (isUser) {
      outputWithPauses = [{
        response_type: "text",
        values: [
          newPayload.input.text,
        ]
      }];
    } else {
      var output = newPayload.output.generic;
      var outputWithPauses = output.reduce(function (pauseAcc, pauseNext, pauseIndex) {
        if (pauseNext.response_type === "pause") {
          return pauseAcc;
        }
        var returnNode = pauseNext;
        var previousNode = output[pauseIndex - 1];
        if (previousNode && previousNode.response_type === "pause") {
            returnNode.pause = {
              time: previousNode.time,
              typing: previousNode.typing
            }
        }
        return pauseAcc.concat([returnNode])
      }, []).filter(function(message) {
        // Filter out some faulty messages we get.
        if (message.selection_policy === "sequential" && message.values.length === 0) {
          return false;
        }
        return true;
      });
    }
   
    var messageArray = outputWithPauses.map(function(message, index) {
      var element = null;
      if (message.response_type === "text") {
        element = renderTextMessage(message, isUser, index);
      }
      if (message.selection_policy) {
        element = renderSelectionPolicy(message, isUser, index);
      }
      if (message.response_type === "pause") {
        element = renderSleepMessage(message, isUser, index);
      }
      if (message.response_type === "option") {
        element = renderOptionMessage(message, isUser, index);
      }

      if (!element) {
        console.error("Nothing for this message type", message);
      }
      return {
        element: element,
        message: message,
      }
    });
    return messageArray;
  }

  function renderTextMessage(message, isUser, index) {
    var currentText = message.values ? (message.values[0].text || message.values[0]) : message.text;
    // Replace newlines with br
    currentText = currentText.replace(/(?:\r\n|\r|\n)/g, '<br>');
    var messageJson = {
      // <div class='segments'>
      'tagName': 'div',
      'classNames': ['segments'],
      'children': [{
        // <div class='from-user/from-watson latest'>
        'tagName': 'div',
        'classNames': [(isUser ? 'from-user' : 'from-watson'), 'latest', ((index === 0) ? 'top' : 'sub')],
        'children': [{
          // <div class='message-inner'>
          'tagName': 'div',
          'classNames': ['message-inner'],
          'children': [{
            // <p>{messageText}</p>
            'tagName': 'p',
            'text': currentText
          }]
        }]
      }]
    };
    return Common.buildDomElement(messageJson);
  }

  function renderOptionMessage(message, isUser, index) {
    var options = message.options;
    var returnElement = null;

    var optionsClassnames = options.length > 2 ? ['option-list-item'] : ['option-button'];
    var optionsChildren = options.map(function(option) {
      return {
        tagName: 'li',
        children: [{
          tagName: 'button',
          text: option.label,
          classNames: optionsClassnames,
          onClick: function(e) {
            // Sometimes we forget to set the value so just use the label
            sendResponse(option.value.input.text || option.label);
          }
        }]
      }
    });

    var title = message.title;

    var messageJson = {
      // <div class='segments'>
      'tagName': 'div',
      'classNames': ['segments', 'options-segment'],
      'children': [{
        // <div class='from-user/from-watson latest'>
        'tagName': 'div',
        'classNames': [(isUser ? 'from-user' : 'from-watson'), 'latest', ((index === 0) ? 'top' : 'sub')],
        'children': [{
          // <div class='message-inner'>
          'tagName': 'div',
          'classNames': ['message-inner'],
          'children': [
            {
              tagName: 'h4',
              'classNames': ['options-heading'],
              text: title,
            },
            {
              tagName: 'ul',
              'classNames': ['options'],
              children: optionsChildren
            }
          ]
        }]
      }]
    };
    returnElement = Common.buildDomElement(messageJson);
    return returnElement;
  }

  function renderSelectionPolicy(message, isUser, index) {
    // Currently we ignore selection policy and just pick a random item - doesn't matter much!
    var textToUse = message.values[Math.floor(Math.random() * message.values.length)];
    return renderTextMessage({
      values: [textToUse], 
    }, isUser, index);
  }

  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Watson.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Watson message is long.

  // Just kidding: last message everytime.
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    // var scrollEl = scrollingChat.querySelector(settings.selectors.fromUser
    //         + settings.selectors.latest);

    var scrollEl = scrollingChat.querySelector(".segments:last-child");

    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  function sendResponse(text) {
     // Retrieve the context from the previous server response
     var context;
     var latestResponse = Api.getResponsePayload();
     if (latestResponse) {
       context = latestResponse.context;
     }
     // Send the user message
     Api.sendRequest(text, context);

     // Clear out any lingering options
     var optionsSegments = document.getElementsByClassName("options-segment");
     while (optionsSegments[0]) {
      optionsSegments[0].parentElement.removeChild(optionsSegments[0]);
     }
  }

  function resetConversation() {
    var latestResponse = Api.getResponsePayload();
    Api.sendRequest(null, latestResponse.context, [ { intent: "Bot_Control_Start_Over", confidence: 0.99 }]);
    var chatBoxElement = document.querySelector(settings.selectors.chatBox);
    // Remove all messages
    while (chatBoxElement.firstChild) {
      chatBoxElement.removeChild(chatBoxElement.firstChild);
    }
  }

  function resetCurrentChecklist() {
    var latestResponse = Api.getResponsePayload();
    var currentChecklist = latestResponse.context.current_checklist;
    Api.sendRequest(null, latestResponse.context, [ { intent: "Checklist_Reset_" + currentChecklist, confidence: 0.99 }]);
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (event.keyCode === 13 && inputBox.value) {
      sendResponse(inputBox.value);
      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
    }
  }
}());
