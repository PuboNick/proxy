/**
 * @description 引入依赖
 */
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const FormData = require('form-data');
const fs = require('fs');
const domain = require('domain');
const moment = require('moment');
const pino = require('pino');
/**
 * @description 目标服务器地址
 * @member production 生产环境地址
 * @member xiao 肖泽霖电脑
 * @member tang 唐金电脑
 * @member jiang 蒋金明电脑
 * @member liu 刘东电脑
 * @member wang 王刚电脑
 */
const uris = {
	production: 'http://10.244.168.180',
	xiao: 'http://10.244.186.93:8085',
	tang: 'http://10.244.186.71:8080',
	jiang: 'http://10.244.186.105:8080',
	liu: 'http://10.244.186.112:8080',
	wang: 'http://10.244.186.84:8080',
	test: 'http://10.244.186.113:8080'
};
/**
 * @description 服务配置
 * @member port 本地监听端口号
 * @member uploadDir 文件上传缓存地址
 */
const config = {
	port: 8099,
	uploadDir: './temp'
};
/**
 * @description pino 配置
 */
const logOptions = {
	level: process.env.LOG_LEVEL || 'info',
	prettyPrint: true,
	base: null,
	timestamp: false
};
/**
 * @description 初始化组件
 */
const multipartMiddleware = multipart({ uploadDir: config.uploadDir });
const d = domain.create();
const app = express();
const logger = pino(logOptions);
/**
 * @description 跨域请求中间件
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Object} next 下一步对象
 */
const middleWare = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
	next();
};
/**
 * @description 判断对象是否为空
 * @param {Object} obj 
 */
const isEmpty = obj => {
	if (!obj) return true;
	return Object.keys(obj).length === 0;
}
/**
 * @description 读取文件缓存
 * @param {Object} config axios 请求配置文件
 * @param {Object} files files 文件
 */
const setFileConfig = (config, files) => {
	let data = new FormData();
	let readStream = fs.createReadStream(files.file.path);
	config.headers = data.getHeaders();
	data.append('file', readStream);
	config.data = data;
};
/**
 * @description 发起HTTP请求
 * @param {Object} req 请求对象
 */
const makeHttp = async (req, config) => {
	if (!isEmpty(req.files)) await setFileConfig(config, req.files);
	if (!isEmpty(req.body)) {
		config.data = req.body;
	}
	for (let i = 0; i < req.rawHeaders.length; i = i + 2) {
		if (req.rawHeaders[i] && req.rawHeaders[i] === 'Authorization') config.headers['Authorization'] = req.rawHeaders[i + 1];
	}
	if (cookie) config.headers['Cookie'] = 'JSESSIONID=' + cookie;
	if (csrfToken) config.headers['X-CSRF-TOKEN'] = csrfToken;
	return axios(config);
};
/**
 * @description 异常处理
 * @param {Object} err 异常对象
 */
const setErr = err => {
	return { code: err.code, msg: err.message, data: err.config, type: 'service error' };
};
/**
 * @description 处理请求，设置请求头
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 */
const toProxy = (req, res) => {
	let config = { url: req.url };
	config.method = req.method.toUpperCase();
	config.headers = {};
	makeHttp(req, config).then(data => res.send(data.data)).catch(err => res.status(500).send(setErr(err)));
};
/**
 * @description 分發請求
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {method} next 下一步
 */
const controller = (req, res, next) => {
	if (req.path === '/_csrf') {
		next();
	} else {
		toProxy(req, res);
	}
};
/**
 * @description 服務開啓成功回調 
 */
const onServeStart = () => {
	logger.info(`Server start at: ${config.port}`);
	logger.info(`Proxy host is: ${uris[option]}`);
	if (csrfToken) logger.info('CSRF set success！');
};
/**
 * @description 打印信息
 * @param {string} reCookie cookie
 * @param {string} reToken crsf_token
 */
const refreshLog = (reCookie, reToken) => {
	logger.info('');
	logger.info('Refresh Cookie&Token');
	logger.info(`Cookie :${reCookie}`);
	logger.info(`Token  :${reToken}`);
	logger.info(`Time   :${moment().format("YYYY-MM-DD HH:mm:ss")}`);
};
/**
 * @description 設置CSRF
 */
const setCsrf = (req, res) => {
	let reCookie = req.query.cookie || '';
	let reToken = req.query.token || '';
	if (reCookie) cookie = reCookie;
	if (reToken) csrfToken = reToken;
	refreshLog(reCookie, reToken);
	res.send('set success!');
};
/**
 * @description 启动服务器，监听端口,主程序
 */
const main = () => {
	axios.defaults.baseURL = uris[option] + '';
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.all('*', middleWare);
	app.all('*', multipartMiddleware, controller);
	app.get('/_csrf', setCsrf);
	app.listen(config.port, () => onServeStart());
};
/**
 * @description 全局错误处理
 */
const errHandler = err => logger.info(err);
/**
 * @description 获取命令行参数,设置变量
 */
let option = process.argv[2] || 'production';
let cookie = process.argv[3] || '';
let csrfToken = process.argv[4] || '';
/**
 * @description 运行程序
 */
void function() {
	d.on('error', errHandler);
	d.run(main);
}();