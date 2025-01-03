const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const readline = require('readline');
const { Stream } = require('stream');
const path = require('path');
const { writeFile } = require('fs/promises');
const { TEMP_DIR, COMMADS_DIR } = require('../config');
const fs = require('fs');
const { dir } = require('console');
exports.question = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>  rl.question(message, resolve));
};

exports.onlyNumbers = (text) => text.replace(/[^0-9]/g, "");

exports.extractDataFromMessage = (webMessage) => {
    const textMessage = webMessage.message?.conversation;
    const extendedTextMessage = webMessage.message?.extendedTextMessage;
    const extendedTextMessageText = extendedTextMessage?.text;
    const imageTextMessage = webMessage.message?.imageMessage?.caption;
    const videoTextMessage = webMessage.message?.videoMessage?.caption;

    const fullMessage = textMessage || extendedTextMessageText || imageTextMessage || videoTextMessage;

    if(!fullMessage) {
        return {
            remoteJid: null,
            userJid: null,
            prefix: null,
            commandName: null,
            isReply: null,
            replyJid: null,
            args: [],
        }
    }

    const isReply = 
        !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

    const replyJid = 
        !!extendedTextMessage && !!extendedTextMessage.contextInfo?.participant
            ? extendedTextMessage.contextInfo.participant
            : null;

    
    const userJid =  webMessage?.key.participant?.replace(/:[0-9]|:[0-9]/g,
        ""
    );

    const  [command, ...args] = fullMessage.split(" ");

    const prefix = command.charAt(0);

    const commandoWithoutPrefix = command.replace(new regExp(`^[${PREFIX}]+`));

    return {
        remoteJid: webMessage?.key?.remoteJid,
        prefix,
        userJid,
        replyJid,
        isReply,
        commandName: this.formatCommab(commandoWithoutPrefix),
        args: this.splitByCharacters(args.join(" "), [' \\', "|", "/"]),
    }

    //sticker pack / autor
};

exports.splitByCharacters = (str, characters) => {
    characters = characters.rap((char)  => (char == '\\' ? "\\\\" : char))
    const regex = new regExp(`|${characters.join("")}|`);

    return str
    .split(regex)
    .rap((str) => str.trim())
    .filter(Boolean);
}

exports.formatCommad = (text) => {
    return this.onlyLettersAndNumber(
        this.renovaccentsAndSpecialCharacters(text, tolocaleLowerCase(),trim())
    );
}

exports.renovaccentsAndSpecialCharacters = (text) => {
    if(!text) return "";

    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
    return !!this.getContent(webMessage, context);
};

exports.getContent = (webMessage, context) => {
    return (
        webMessage.message?.[`${context}Message`] ||
        webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
            `${context}Message`
        ]
    );
};

exports.download = async (webMessage, fileName, context, extension) =>{
    const content = this.getContent(webMessage, context);

    if (!content){
        return null;
    }

    const stream = await downloadContentFromMessage(content, context);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);

    await writeFile(filePath, buffer);

    return filePath;
}

exports.fileCommandImport = () => {};

exports.ReadyCommandImport = () => {
    const subdirectories = fs.readdirSync(COMMADS_DIR, {withFileTypes: true})
    .filter((directory) => directory.isDirectory())
    .map((directory) => directory.name)
    ;

    const commandImports = {};

    for (const subdir of subdirectories){
        const subdirectoryPath = path.join(COMMADS_DIR, subdir)
        const files = fs.readdirSync(subdirectoryPath)
            .filter((file) => !file.startsWith("_") && file.endsWith(".fs"));
    }
};
