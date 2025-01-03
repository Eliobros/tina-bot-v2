const { loadCommonFunction } = require('../utils/loadCommonFunctions');
const { dynamicCommand } = require('../utils/dynamicCommand');
exports.onMessagesUpsert = async ({ socket, messages }) => {
    if(!messages.length) {
        return;
    }

    const webMessages = messages[0];
    const comonFunctions = onloadwithFunctions({socket, webMessages});

    await dynamicCommand(commonFunctions);
}