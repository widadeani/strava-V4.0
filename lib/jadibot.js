const {
  default: makeWASocket,
  delay,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  proto,
  makeInMemoryStore,
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const readline = require('readline');
const NodeCache = require('node-cache');
const chalk = require('chalk');
const { color, mylog } = require('./color');
const { fetchJson } = require('./myfunc'); // Ensure this function exists
const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent' }),
});

const phoneNumber = global.ownerBot;
const pairingCode = !!phoneNumber || process.argv.includes('--pairing-code');
const useMobile = process.argv.includes('--mobile');
const xlec = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (query) => new Promise((resolve) => xlec.question(query, resolve));

if (!global.conns || !(global.conns instanceof Array)) {
  global.conns = [];
}

const jadibot = async (connId, phone, handleConnection, messageJid) => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, '../jadibot/' + phone),
    pino({ level: 'silent' })
  );
  const cache = new NodeCache();

  const startConnection = async () => {
    const waSocket = makeWASocket({
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
        if (msg.buttonsMessage || msg.templateMessage || msg.listMessage) {
          return {
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
      getMessage: async (message) => {
        const jid = jidNormalizedUser(message.remoteJid);
        const loadedMessage = await store.loadMessage(jid, message.id);
        return loadedMessage?.message || '';
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      msgRetryCounterCache: cache,
    });

    if (!waSocket.authState.creds.registered) {
      setTimeout(async () => {
        const code = '' + phone;
        console.log(chalk.red.bold(`[ Jadibot ] -> (+${code})`));
        const pairingCodeResponse = await waSocket.requestPairingCode(code);
        const formattedCode = pairingCodeResponse?.match(/.{1,4}/g)?.join('-') || pairingCodeResponse;
        global.codepairing = '' + formattedCode;
        console.log('Code Pairing: ' + global.codepairing);
      }, 3000);
    }

    store.bind(waSocket.ev);

    waSocket.ev.on('messages.upsert', async (update) => {
      try {
        const msg = update.messages[0];
        if (msg.message) {
          require('../strava')(waSocket, msg, store);
        }
      } catch (error) {
        console.error(error);
      }
    });

    waSocket.ev.on('connection.update', (update) => {
      if (update.connection === 'open') {
        waSocket.id = waSocket.decodeJid(waSocket.user.id);
        waSocket.time = Date.now();
        const userJid = waSocket.decodeJid(waSocket.user.id);
        global.conns.push(waSocket);
        handleConnection(
          `*Connected To Whatsapp ✓*\n• User : ${userJid.split('@')[0]}\n• Time : ${Date.now()}`,
          [userJid]
        );
        const text = `「 *JADIBOT-CONNECT* 」\n• User : @${userJid.split('@')[0]}\n• Time : ${Date.now()}\n\n*Bot Sudah Terkoneksi!*\n*Silahkan Ketik* .menu *Untuk Memulai*`;
        waSocket.sendMessage(messageJid, { text, mentions: [userJid] });
        console.log(mylog('Connected ' + waSocket.user.id));
      } else if (update.connection === 'close') {
        console.log(mylog('Disconnected!'));
        startConnection();
      }
    });

    waSocket.sendTextWithMentions = async (jid, text, quotedMessage, options = {}) => {
      return waSocket.sendMessage(
        jid,
        {
          text,
          contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((match) => match[1] + '@s.whatsapp.net'),
          },
          ...options,
        },
        { quoted: quotedMessage }
      );
    };

    waSocket.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decodedJid = jidDecode(jid) || {};
        return (decodedJid.user && decodedJid.server)
          ? `${decodedJid.user}@${decodedJid.server}`
          : jid;
      }
      return jid;
    };

    waSocket.sendMentions = (jid, text, mentionedJids = [], quotedMessage) => {
      return waSocket.sendMessage(
        jid,
        {
          text,
          mentions: mentionedJids,
        },
        { quoted: quotedMessage }
      );
    };

    waSocket.ev.on('creds.update', saveCreds);
    return waSocket;
  };

  startConnection().catch(console.error);
};

module.exports = {
  jadibot,
  conns: global.conns,
};
