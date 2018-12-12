const watsonAssistant = require("./watson-assistant");
const Response = require("./response");

class Conversation {
    constructor({ useContext } = {}) {
        this.context = useContext || null;
        this.dialogNodes = null;
    }

    async init({ startConversation } = {}) {
        if (startConversation) {
            return this.sendMessage({});
        }
    }

    async sendMessage(input) {
        let formattedInput = input;
        if (typeof input === "string") {
            formattedInput = { text: input };
        }

        const result = await watsonAssistant.sendMessage(
            this.context,
            formattedInput
        );

        const messageObjects = result.output.generic;

        this.context = result.context;
        return new Response(messageObjects, result);
    }
}

module.exports = Conversation;
