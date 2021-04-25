export default {
  log4: {
    appenders: {
      ruleConsole: { type: 'console' },
      ruleFile: {
        type: 'dateFile',
        filename: 'logs/server-',
        pattern: 'yyyy-MM-dd.log',
        maxLogSize: 10 * 1000 * 1000,
        numBackups: 3,
        alwaysIncludePattern: true,
      },
    },
    categories: {
      default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' },
    },
  },
  logOptions: { level: 'info', format: ':method :url' },
  multipart: {
    uploadDir: process.env.FILE_DIR,
    limit: '500mb',
  },
};
