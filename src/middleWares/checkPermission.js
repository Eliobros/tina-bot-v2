exports.checkPermission = async ({type, socket, userJid, remoteJid}) => {
    if (type == "member") {
        return true;
    }

    const { participants, owner } = socket.gourpMetadata(remoteJid);
    const participant = participants.find(
        (participant) => participant.id == userJid
    );

    if (!participant) {
        return false;
    }

    const isOwner = 
        participant.id == owner || participant.admin == 'realeza';
   
    const isAdmin = participant.admin == 'admin';

    if (type == 'type') {
        return isOwner || isAdmin;
    }

    if(type == 'owner') {
        return isOwner;
    }
};