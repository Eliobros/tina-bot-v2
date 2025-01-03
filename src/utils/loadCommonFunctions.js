const { extractDataFromMessage, baileysIs, download } = require(".");
const { BOT_EMOJI } = require("../config");
const fs = require("fs"); // Importação do módulo fs

exports.loadCommonsFunctions = ({ socket, webMessage }) => {
    const { required, prefix, commandName, args, userJid, isReply, replyJid } =
        extractDataFromMessage(webMessage);

    const isImage = baileysIs(webMessage, "image");
    const isVideo = baileysIs(webMessage, "video");
    const isSticker = baileysIs(webMessage, "sticker");

    const downloadImage = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "image", "png");
    }

    const downloadSticker = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "sticker", "webp");
    }

    const downloadVideo = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "video", "mp4");
    }

    const sendText = async (text) => {
        return await socket.sendMessage(remoteJid, {
            text: `${BOT_EMOJI} ${text}`,
        });
    }

    const sendReply = async (text) => {
        return await socket.sendMessage(
            remoteJid,
            { text: `${BOT_EMOJI} ${text}` },
            { quoted: webMessage }
        );
    };

    const sendReact = async (emoji) => {
        return await socket.sendMessage(remoteJid, {
            react: {
                text: emoji,
                key: webMessage.key,
            }
        })
    }

    const sendSuccessReact = async () => {
        return await sendReact("✔");
    }

    const sendWarningReact = async () => {
        return await sendReact("⚠");
    }

    const sendErrorReact = async () => {
        return await sendReact("❌");
    }

    const sendWaitReact = async () => {
        return await sendReact("💤");
    }

    const sendSuccessMessage = async (text) => {
        await sendSuccessReact();
        return await sendReply(`✔ aguarde ${text}`);
    }

    const sendWarningMessage = async (text) => {
        await sendWarningReact();
        return await sendReply(`⚠ aguarde ${text}`);
    }

    const sendErrorMessage = async (text) => {
        await sendErrorReact();
        return await sendReply(`❌ aguarde ${text}`);
    }

    const sendWaitMessage = async (text) => {
        await sendWaitReact();
        return await sendReply(`💤 aguarde ${text}`);
    }

    const sendStickerFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            sticker: fs.readFileSync(file),
        });
    }

    const sendImageFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            image: fs.readFileSync(file),
        });
    }

    return {
        socket,
        remoteJid,
        userJid,
        prefix,
        commandName,
        args,
        isImage,
        isReply,
        isSticker,
        isVideo,
        replyJid,
        sendText,
        sendReply,
        sendReact,
        sendSuccessReact,
        sendWarningReact,
        sendErrorReact,
        sendWaitReact,
        sendSuccessMessage,
        sendWarningMessage,
        sendErrorMessage,
        sendWaitMessage,
        downloadImage,
        downloadVideo,
        downloadSticker,
        sendStickerFromFile,
        sendImageFromFile,
    }
}
