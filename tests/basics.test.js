const Conversation = require("./helpers/conversation");

describe("basic functionality", () => {
    it("greets us when we initiate the conversation", async () => {
        const convo = new Conversation();
        await convo.init();
        const helloResponse = await convo.sendMessage({ });
        expect(helloResponse.messages).toHaveLength(1);
        expect(helloResponse.messages[0].values[0]).toEqual("G'day. How can I help you?");
    });
    
    it("can maintain a conversation context over multiple messages", async () => {
        const convo = new Conversation();
        await convo.init();
        const firstResponse = await convo.sendMessage({ });
        const secondResponse = await convo.sendMessage("actual gibberish nobody could understand this");
        expect(firstResponse.rawResponse.context.conversation_id).toEqual(secondResponse.rawResponse.context.conversation_id);
    });
});
