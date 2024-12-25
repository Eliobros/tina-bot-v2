//importando a biblioteca baileys

const {WhiskeySockets, UseMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion,isJidBroadcast} = require('@adiwajshing/baileys ');
  
const { PREFIX, OWNER_NUMBER} = require("../../config");

module.exports = {
  name: "dono",
  description: "Envia o contato do dono ao usuárioaie solicitou",
  commands: ["dono", "infodono"],
  usage: `${PREFIX}dono`,
  handle: async ({ }) => {
    // código do comando

    
  },
};