const Conversation = require("../helpers/conversation");

describe("asking for leave where I match all criteria", () => {
    const convo = new Conversation();

    it("* Initializes a conversation", async () => {
        await convo.init({
            startConversation: true
        });
    });

    let applyActionResponse;
    it("# I want to apply for compassionate leave", async () => {
        applyActionResponse = await convo.sendMessage(
            "I want to apply for compassionate leave"
        );
        expect(applyActionResponse).toBeDefined();
    });

    it("< has recognised our intent", async () => {
        expect(
            applyActionResponse.intentConfidenceScores["ask_should_i_apply"]
        ).toBeGreaterThanOrEqual(0.7);
    });

    it("< tells us the two requirements and asks if posting will resolve the issue", async () => {
        expect(applyActionResponse.messages).toHaveLength(5);
        expect(applyActionResponse.messages[0].text).toEqual(
            "When applying for a compassionate posting you’ll need to show two things:<ol><li>that your circumstances have “merit”</li><li>that your circumstances can be resolved during the compassionate leave period.</li></ol>"
        );
        expect(applyActionResponse.messages[2].text).toEqual(
            "Let’s first take a look at the second requirement..."
        );
        expect(applyActionResponse.messages[3].text).toEqual(
            "Do you think you’d be able to show that a compassionate posting will resolve the issue(s) that are affecting you?"
        );
    });
    it("< pauses after the 1st message", async () => {
        expect(applyActionResponse.messages[1].response_type).toEqual("pause");
    });

    it("< provides us with a yes and a no option", async () => {
        expect(applyActionResponse.messages[4].response_type).toEqual("option");
        expect(applyActionResponse.messages[4].optionLabels).toEqual(["Yes", "No"]);
    });

    let resolveYesResponse;
    it("# resolve issue yes", async () => {
        resolveYesResponse = await convo.sendMessage("yes");
        expect(resolveYesResponse).toBeDefined();
    });

    it("< asks if we can meet posting obligations", async () => {
        expect(resolveYesResponse.messages).toHaveLength(3);
        expect(resolveYesResponse.messages[0].text).toEqual("and...");
        expect(resolveYesResponse.messages[1].text).toEqual(
            "Do you think you’d be able to show that you could meet your posting obligations (without any restrictions) once your compassionate post has ended?"
        );
    });

    it("< provides us with a yes and a no option", async () => {
        expect(resolveYesResponse.messages[2].response_type).toEqual("option");
        expect(resolveYesResponse.messages[2].optionLabels).toEqual(["Yes", "No"]);
    });

    let obligationYesResponse;
    it("# meeting obligations yes", async () => {
        obligationYesResponse = await convo.sendMessage("yes");
        expect(obligationYesResponse).toBeDefined();
    });

    it("< asks about other requirements and requests response to more severe circumstances", async () => {
        expect(obligationYesResponse.messages).toHaveLength(5);
        expect(obligationYesResponse.messages[0].text).toEqual(
            "OK, great. That means you fulfil one of the two requirements."
        );
        expect(obligationYesResponse.messages[1].text).toEqual(
            "Let’s look at the other requirement — whether your circumstances may be considered as having “merit”."
        );
        expect(obligationYesResponse.messages[3].text).toEqual(
            "If you compared your circumstances to those encountered by other Air Force members, do you think you could prove that yours were clearly more severe?"
        );
    });
    it("< pauses after the 2nd message", async () => {
        expect(obligationYesResponse.messages[2].response_type).toEqual("pause");
    });

    it("< provides us with a yes and a no option", async () => {
        expect(obligationYesResponse.messages[4].response_type).toEqual("option");
        expect(obligationYesResponse.messages[4].optionLabels).toEqual(["Yes", "No"]);
    });

    let severeYesResponse;
    it("# more severe yes", async () => {
        severeYesResponse = await convo.sendMessage("yes");
        expect(severeYesResponse).toBeDefined();
    });

    it("< asks about other requirements and requests response to exceptional circumstances", async () => {
        expect(severeYesResponse.messages).toHaveLength(3);
        expect(severeYesResponse.messages[0].text).toEqual("and...");
        expect(severeYesResponse.messages[1].text).toEqual(
            'If you were to describe your circumstances to others, do you think they might consider them to be "very exceptional", or be quite sympathetic and compassionate towards you?'
        );
    });

    it("< provides us with a yes and a no option", async () => {
        expect(severeYesResponse.messages[2].response_type).toEqual("option");
        expect(severeYesResponse.messages[2].optionLabels).toEqual(["Yes", "No"]);
    });

    let exceptionalYesResponse;
    it("# exceptional circumstances yes", async () => {
        exceptionalYesResponse = await convo.sendMessage("yes");
        expect(exceptionalYesResponse).toBeDefined();
    });

    it("< asks about other requirements and requests if similar to a set of options", async () => {
        expect(exceptionalYesResponse.messages).toHaveLength(4);
        expect(exceptionalYesResponse.messages[0].text).toEqual("lastly...");
        expect(exceptionalYesResponse.messages[1].text).toEqual(
            'Do your circumstances sound like they might be similar to any of the following?'
        );
    });

    it("< provides us with a selection of circumstances as options", async () => {
        expect(exceptionalYesResponse.messages[2].response_type).toEqual("option");
        expect(exceptionalYesResponse.messages[2].optionLabels).toEqual([
            "1. Disruption to children's education",
            "2. Interference to spouse employment",
            "3. Family separation",
            "4. Dislocation from extended family",
            "5. Collocation with a spouse or partner" 
        ]);
    });

    it("< provides us with a 'None of the above' option in a separate message", async () => {
        expect(exceptionalYesResponse.messages[3].response_type).toEqual("option");
        expect(exceptionalYesResponse.messages[3].optionLabels).toEqual(["None of the above"]);
    });

});
