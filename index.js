const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const FormData = require('form-data');
const fs = require('fs');
const d = require('domain').create();
const moment = require('moment');
const dotenv = require('dotenv');
const uris = require("./urls.json");

/**
 * @description 獲取當前時間戳
 */
const now = () => moment().format("YYYY-MM-DD HH:mm:ss");
/**
 * @description 跨域请求中间件
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Object} next 下一步对象
 */
const middleWare = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-type, Authorization, X-CSRF-TOKEN, *');
	res.header('Access-Control-Allow-Methods', '*');
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
 * @description 设置 access_token
 * @param {Object} config 配置
 * @param {String} token access_token
 */
const setAuth = (config, headerName, header) => {
	if (headerName === 'Authorization') config.headers['Authorization'] = header;
};
/**
 * @description 发起HTTP请求
 * @param {Object} req 请求对象
 */
const makeHttp = async (req, config) => {
	if (!isEmpty(req.files)) await setFileConfig(config, req.files);
	if (!isEmpty(req.body)) config.data = req.body;
	for (let i = 0; i < req.rawHeaders.length; i = i + 2) {
		setAuth(config, req.rawHeaders[i], req.rawHeaders[i + 1]);
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
	
	return { url, method, params, data };
};
/**
 * @description 請求異常處理
 * @param {Error} err 錯誤對象
 * @param {Response} res 返回對象
 */
const reqErrHandeler = (err, res) => {
	let { url, params, data, method } = err.config;
	let response = { status: 500, message: '網絡連接失敗！', timestamp: now() };
	if (err.response) {
		let { status, timestamp, message } = err.response.data;
		response = { status, timestamp, message };
	}
	console.error({ url, params, data, method, ...response });
	res.status(response.status).send({ url, params, data, method, ...response });
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
	makeHttp(req, config).then(data => res.send(data.data)).catch(err => reqErrHandeler(err, res));
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
	} else if (req.method.toUpperCase() === 'OPTIONS') {
		res.send();
	} else {
		toProxy(req, res);
	}
};
/**
 * @description 服務開啓成功回調 
 */
const onServeStart = () => {
	console.log(`Server start at: ${process.env.SERVER_PORT}`);
	console.log(`Proxy host is: ${uris[option]}`);
	if (csrfToken) console.log('CSRF set success！');
};
/**
 * @description 打印信息
 * @param {string} reCookie cookie
 * @param {string} reToken crsf_token
 */
const refreshLog = (reCookie, reToken) => {
	console.log('');
	console.log('Refresh Cookie&Token');
	console.log(`Cookie :${reCookie}`);
	console.log(`Token  :${reToken}`);
	console.log(`Time   :${now()}`);
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
	const app = express();
	const multipartMiddleware = multipart({ uploadDir: process.env.FILE_DIR, limit: '500mb' });
	axios.defaults.baseURL = uris[option];
	app.use(bodyParser.json({ limit: '500mb' }));
	app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));
	app.all('*', middleWare);
	app.all('*', multipartMiddleware, controller);
	if (process.env.REFRESH !== 'false') app.get('/_csrf', setCsrf);
	app.listen(process.env.SERVER_PORT, () => onServeStart());
};
/**
 * @description 全局错误处理
 */
const errHandler = err => console.log(err);
/**
 * @description 获取命令行参数,设置变量
 */
let option = process.argv[2] || 'production';
let cookie = process.env.COOKIE || '';
let csrfToken = process.env.TOKEN || '';
/**
 * @description 运行程序
 */
const start = () => {
	dotenv.config();
	d.on('error', errHandler);
	d.run(main);
};
/**
 * @desciption 驗證參數
 */
if (uris[option]) {
	start();
} else {
	console.log(`目標服務器爲空，請確認選項 ${option} 是否正確！`);
}