const { verifyPrefix } = require("../middleWares");
const {BOT_NAME, BOT_OWNER_NICK} = require('../config');
const {checkPermission} = require('../middleWares/checkPermission')
const { WarningError, DangerError, InvalidParameterError} = require('../Errors');
const {findCommandImport} = require('.')

exports.dynamicCommand = async (paramsMindler) => {
  const { userJid, commandName, prefix, sendWarningReply, sendErrorReply} =
   paramsMindler;

  const {type, command} = findCommandImport(commandName);

  if (!verifyPrefix(prefix)) {
    return await sendWarningReply(
        `=====================
        ||❌COMANDO NAO ENCONTRADO❌
        ||Usuario: ${userJid}
        ||comando: ${prefix}${command} nao encontrado
        ||Por avor leia o menu digite o comando ${prefix}menu
        ||por: ${BOT_NAME}
        ||===============================
        `
    )

}

    if (! await checkPermission({type, ...paramsHandler})) {
        return sendErrorReply("Como ousa proferir tais palavras seu ser inferior😠");
    }

    try {

        await command.handle({...paramsHandler, type});

    } catch (error) {
        console.log(error);

        if (error instanceof InvalidParameterError) {
            await sendWarningReply(`Parametros invalidos ${error.message}`);
        }else if(error instanceof WarningError) {
            await sendWarningReply(error.message);
        }else if (error instanceof DangerError) {
            await sendWarningReply(error.message)
        }else{
            await sendErrorReply(`Desculpe ocorreu um erro ao executar o comando ${command.name}! O desenvolvedor ${BOT_OWNER_NICK} foi notificado
                
                😉 *Detalhes do erro*: ${error.message}`)
        }
    };
};