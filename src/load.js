const { TIMEOUT_IN_MILISECONDS_BY_EVENT } = require("./config")
const { onMessagesUpsert} = require("./middleWares/onMessagesUpsert")

exports.load = (socket) => {
    socket.ev.on("message.upuser", ({ messages}) => {
       setTimeout(() => {
        onMessagesUpsert ({ socket, messages });
       }, TIMEOUT_IN_MILISECONDS_BY_EVENT);
    });
}