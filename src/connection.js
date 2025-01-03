const {default: makeWSocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason} = require("@whiskeysockets/baileys")
const path = require('path')
const piono = require('pino');
const { question, onlyNumbers } = require("./utils");

exports.connect = async () => {
    const {state, saveCreds} = await useMultiFileAuthState(
        path.resolve(__dirname, "..", "assets", "auth", "baileys")
    );


const { version } = await fetchLatestBaileysVersion();

    const socket = makeWSocket({
        printQRInTerminal: false,
        version,
        logger: pino({level: "error"}),
        auth: state,
        browser: ["Chrome (Linux)", "", ""],
        makeOnLineConnect: true,
    });

    if(!socket.authState.creds.registered) {
        const phoneNumber = await question("Digite o seu numero de telefone sem o +:");

        if(!phoneNumber) {
            throw new Error("Erro de telefone invalido");
        }

        const code  = await socket.requestPairingCode(onlyNumbers(phoneNumber));

        console.log(`codigo de pareamennto: ${code}`);
    }

    socket.ev.on("connection.update", (update) => {
        const {connection, lastDisconnect } = update;

        if(connection == 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode = DisconnectReason.loggedOut;

            if (shouldReconnect) {
                this.connect();
            }
        }
    });

    socket.ev.on("creds.update", saveCreds);
};