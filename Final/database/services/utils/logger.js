

const log = {
  info: (msg, meta = {}) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message: msg, ...meta }));
  },
  warn: (msg, meta = {}) => {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message: msg, ...meta }));
  },
  error: (msg, meta = {}) => {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message: msg, ...meta }));
  },
  transaction: (action, meta = {}) => {
    console.log(JSON.stringify({ level: 'TRANSACTION', timestamp: new Date().toISOString(), action, ...meta }));
  },
};

module.exports = log;