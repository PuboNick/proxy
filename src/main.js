import domain from 'domain';
import log4js from 'log4js';
import dotenv from 'dotenv';
import express, { json, urlencoded } from 'express';
import multipart from 'connect-multiparty';

import config from '../config';

// 缓存
// const state = {};

const logger = log4js.getLogger('normal');

/**
 * 开启跨域
 * @param {Request} req 请求
 * @param {Response} res 返回
 * @param {*} next 下一步
 */
const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-type, Authorization, X-CSRF-TOKEN, *'
  );
  res.header('Access-Control-Allow-Methods', '*');
  next();
};

/**
 * 处理请求
 * @param {Request} req 请求
 * @param {Response} res 返回
 * @param {*} next 下一步
 */
const controller = (req, res, next) => {
  if (req.path === '/_csrf') {
    next();
  } else if (req.method.toUpperCase() === 'OPTIONS') {
    res.send();
  } else {
    // toProxy(req, res);
  }
};

/**
 * 监听服务器异常
 */
const onServerError = (error) => {
  logger.error(error);
};

/**
 * 程序启动成功
 */
const onServeStart = () => {
  logger.info(`服务启动成功，监听端口: ${process.env.SERVER_PORT}`);
};

/**
 * 主程序，程序入口
 */
const main = () => {
  const app = express();
  const multipartMiddleware = multipart(config.multipart);
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));
  app.use(log4js.connectLogger(logger, config.logOptions));
  app.all('*', cors);
  app.all('*', multipartMiddleware, controller);
  app.listen(process.env.SERVER_PORT, () => onServeStart());
};

/**
 * 初始化配置
 */
const init = () => {
  const d = domain.create();
  dotenv.config();
  log4js.configure(config.log4);
  d.on('error', onServerError);
  d.run(main);
};

init();
