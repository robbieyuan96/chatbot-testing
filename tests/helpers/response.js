// This lil number turns an raw message object into a more intuitive structure for tests
class Response {
    constructor(messageObjects, response) {
        this.rawResponse = response;
        this.intentConfidenceScores = response.intents.reduce((acc, n) => {
            return {
                ...acc,
                [n.intent]: n.confidence,
            };
        }, {});

        this.messages = messageObjects
        .filter(messageObject => {
            if (messageObject.selection_policy && messageObject.values.length === 0) return false;
            return true;
        }).map(messageObject => {
            if (
                messageObject.response_type === "text" &&
                !messageObject.values &&
                messageObject.text
            ) {
                return {
                    ...messageObject,
                    values: [
                        messageObject.text,
                    ]
                }
            }

            if (
                 (messageObject.response_type === "text" && messageObject.values.length === 1 ) ||
                 (messageObject.selection_policy && messageObject.values.length === 1)
            ) {
                return {
                    ...messageObject,
                    text: messageObject.values[0].text || messageObject.values[0],
                }
            }

            if (messageObject.response_type === "option") {
                return {
                    ...messageObject,
                    optionLabels: messageObject.options.map(o => o.label),
                }
            }
            
            return messageObject;
        });
    }
}

module.exports = Response;