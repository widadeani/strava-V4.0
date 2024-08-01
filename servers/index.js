require('../config');
const {
  default: LexxyBotConnect,
  delay,
  jidNormalizedUser,
  PHONENUMBER_MCC,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const pino = require('pino');
const { join } = require('path');
const { await, getBuffer, fetchJson } = require('../lib/myfunc');
const makeWASocket = require('@whiskeysockets/baileys').default;
const readline = require('readline');
const NodeCache = require('node-cache');
const chalk = require('chalk');
const util = require('util');
const { color, mylog } = require('../lib/color');

const store = makeInMemoryStore({
  logger: pino().child({
    level: 'silent',
    stream: 'store',
  }),
});

let phoneNumber = global.botNumber;
const autoread_sw = true;
const pairingCode = !!phoneNumber || process.argv.includes('--pairing-code');
const useMobile = process.argv.includes('--mobile');

const xlec = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => xlec.question(text, resolve));

async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, './session'));
  const msgRetryCounterCache = new NodeCache();
  const socket = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    mobile: useMobile,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: 'fatal' }).child({ level: 'fatal' })
      ),
    },
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version,
    patchMessageBeforeSending: (msg) => {
      const isViewOnceMessage =
        msg.buttonsMessage || msg.templateMessage || msg.listMessage;
      if (isViewOnceMessage) {
        msg = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...msg,
            },
          },
        };
      }
      return msg;
    },
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid);
      const message = await store.loadMessage(jid, key.id);
      return message?.message || '';
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache,
  });

  store.bind(socket.ev);

  if (pairingCode && !socket.authState.creds.registered) {
    if (useMobile) {
      console.log('Cannot use pairing code with mobile API');
    }
    console.log(chalk.cyan('┌───────────────'));
    console.log('│• ' + chalk.redBright('Silakan Tulis Nomor Whatsapp Anda'));
    console.log('│• ' + chalk.redBright('Contoh : 628xxxxx'));
    console.log(chalk.cyan('└───────────────'));

    let userNumber;
    userNumber = await question(chalk.bgBlack(chalk.greenBright('Your WhatsApp Number : ')));
    userNumber = userNumber.replace(/[^0-9]/g, '');

    if (!Object.keys(PHONENUMBER_MCC).some((mcc) => userNumber.startsWith(mcc))) {
      console.log(chalk.bgBlack(chalk.redBright('Start with country code of your WhatsApp Number, Example : 628xxxxxxxx')));
      process.exit(0);
    }

    setTimeout(async () => {
      let pairingCode = await socket.requestPairingCode(userNumber);
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
      console.log(chalk.bgBlack(chalk.greenBright('Copy Pairing Code :')), chalk.black(chalk.white(pairingCode)));
    }, 2000);
  }

  socket.ev.on('messages.upsert', async (messageUpdate) => {
    try {
      const message = messageUpdate.messages[0];
      if (!message.message) {
        return;
      }
      require('../strava')(socket, message, store);
    } catch (error) {
      console.log(error);
    }
  });

  socket.ev.on('connection.update', (update) => {
    console.log('Connection Update :', update);
    if (update.connection === 'open') {
      console.log(mylog('Connected ' + socket.user.id));
    } else if (update.connection === 'close') {
      console.log(mylog('Disconnected!'));
      connectToWhatsApp();
    }
  });

  socket.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    socket.sendMessage(
      jid,
      {
        text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (mention) => mention[1] + '@s.whatsapp.net'
          ),
        },
        ...options,
      },
      { quoted }
    );

  socket.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decoded = jidDecode(jid) || {};
      return (decoded.user && decoded.server && decoded.user + '@' + decoded.server) || jid;
    }
    return jid;
  };

  socket.sendmentions = (jid, text, mentions = [], quoted) =>
    socket.sendMessage(
      jid,
      {
        text,
        mentions,
      },
      { quoted: msg }
    );

  socket.ev.on('creds.update', saveCreds);

  socket.ev.process(async (events) => {
    if (events['messages.upsert']) {
      const upserts = events['messages.upsert'];
      for (const upsert of upserts.messages) {
        if (upsert.key.remoteJid === 'status@broadcast') {
          if (upsert.message?.protocolMessage) {
            return;
          }
          await delay(3000);
          autoread_sw && (await socket.readMessages([upsert.key]));
        }
      }
    }
  });

  return socket;
}

connectToWhatsApp().catch((error) => console.log(error));

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright('Update ' + __filename));
  delete require.cache[file];
  require(file);
});
