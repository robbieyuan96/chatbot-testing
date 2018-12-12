// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var dialogNodes = { dialog_nodes: [] };
  var messageEndpoint = '/api/message';

  // Jericoh
  var dialogNodeEndpoint = '/api/dialog-nodes'

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,

    fetchDialogNodes: fetchDialogNodes,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    },
    getDialogNodes: function() {
      return dialogNodes.dialog_nodes;
    },
  };

  // Jericoh
  function fetchDialogNodes(callback) {
    // Built http request
    var http = new XMLHttpRequest();
    http.open('GET', dialogNodeEndpoint);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        dialogNodes = JSON.parse(http.responseText);
        callback();
      }
    };
    // Send request
    http.send();
  }

  // Send a message request to the server
  function sendRequest(text, context, intents) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }
    if (intents) {
      payloadToWatson.intents = intents;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }
}());
