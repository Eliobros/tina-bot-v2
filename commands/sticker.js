module.exports = {
    name: 'sticker',
    description: 'Criar figurinha',
    async execute(sock, data) {
        const { msg, from, pushName, isGroupMsg, isGroupAdmins } = data;
        try {
            if (isGroupMsg) {
                if (isGroupAdmins) {
                    if (msg.message.imageMessage) {
                        const imageBuffer = await sock.downloadMediaMessage(msg);
                        await sock.sendMessage(from, { 
                            sticker: imageBuffer, 
                            sendEphemeral: true 
                        });
                        await sock.sendMessage(from, { 
                            text: `Olá ${pushName}, aqui está a sua figurinha criada com sucesso.`, 
                            sendEphemeral: true 
                        });
                    } else {
                        await sock.sendMessage(from, { 
                            text: 'Por favor, envie uma imagem para criar a figurinha.', 
                            sendEphemeral: true 
                        });
                    }
                } else {
                    await sock.sendMessage(from, { 
                        text: 'Apenas administradores do grupo podem usar este comando.', 
                        sendEphemeral: true 
                    });
                }
            } else {
                await sock.sendMessage(from, { 
                    text: 'Este comando só pode ser usado em grupos.', 
                    sendEphemeral: true 
                });
            }
        } catch (error) {
            console.error('Erro ao criar figurinha:', error);
            await sock.sendMessage(from, { 
                text: 'Houve um erro ao criar a figurinha. Tente novamente mais tarde.', 
                sendEphemeral: true 
            });
        }
    }
};