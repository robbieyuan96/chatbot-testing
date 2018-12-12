const watson = require("watson-developer-cloud"); // watson sdk
const assistant = new watson.AssistantV1({
    // If unspecified here, the ASSISTANT_USERNAME and ASSISTANT_PASSWORD env properties will be checked
    // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
    username: process.env.ASSISTANT_USERNAME || "<username>",
    password: process.env.ASSISTANT_PASSWORD || "<password>",
    version: "2018-07-10",
});

async function sendMessage(context, input) {
    const workspace = process.env.WORKSPACE_ID;
    const payload = {
        workspace_id: workspace,
        context: context || {},
        input: input || {},
    };

    // Send the input to the assistant service
    return new Promise((resolve, reject) => {
        assistant.message(payload, function(err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

async function getDialogNodes() {
    const workspace = process.env.WORKSPACE_ID;
    const payload = {
        workspace_id: workspace,
        page_limit: 1000,
    };

    return new Promise((resolve, reject) => {
        // Send the input to the assistant service
        assistant.listDialogNodes(payload, function(err, data) {
            if (err) return reject(err);
            resolve(data.dialog_nodes);
        });
    });
}

module.exports = {
    sendMessage,
    getDialogNodes,
};
