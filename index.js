const express = require('express');
const proxy = require('http-proxy-middleware');
const dotenv = require('dotenv');
const domain = require('domain');
const moment = require('moment');
const urls = require('./urls.json');

let store = require('./config.json');
let option = {};

const setCookieAndCsrf = (req, res) => {
	if (req.method.toUpperCase() !== "OPTIONS") refreshCookieAndCsrf(req.query);
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-CSRF-TOKEN, *');
	res.header('Access-Control-Allow-Methods', '*');
	res.send("Reresh success!");
};

const refreshCookieAndCsrf = params => {
	store = params;
	refreshLog(params);
};

const refreshLog = ({ token, cookie }) => {
	console.log('');
	console.log('[INFO] Refresh Cookie And Token');
	console.log(`[INFO] Cookie :${cookie}`);
	console.log(`[INFO] Token  :${token}`);
	console.log(`[INFO] Time   :${moment().format("YYYY-MM-DD HH:mm:ss")}`);
};

const setAuthorization = (proxyReq, headerName, header) => {
	if (headerName === 'Authorization') proxyReq.setHeader('Authorization', header);
};

option.onProxyReq = (proxyReq, req, res) => {
	if (req.path === "/_csrf") setCookieAndCsrf(req, res);
	if (store.cookie) proxyReq.setHeader('Cookie', `JSESSIONID=${store.cookie}`);
	if (store.token) proxyReq.setHeader('X-CSRF-TOKEN', store.token);
	for (let i = 0; i < req.rawHeaders.length; i = i + 2) {
		setAuthorization(proxyReq, req.rawHeaders[i], req.rawHeaders[i + 1]);
	}
};

const errHandler = error => {
	console.error(error);
};

const startServer = ({ SERVER_PORT = 8080 }) => {
	const app = express();
	const server = app.listen(SERVER_PORT, () => startSuccess(server));
	app.use('*', proxy(option));
};

const startSuccess = server => {
	console.log(`[INFO] Server started: ${server.address().port}!`);
};

const main = () => {
	const argv = process.argv[2] || 'default';
	const url = urls[argv];
	if (!url) throw `[ERROR] Unable to find '${argv}' from ${JSON.stringify(Object.keys(urls))}`;
	dotenv.config();
	option.target = url;
	startServer(process.env);
};

void function() {
	const d = domain.create();
	d.on('error', errHandler);
	d.run(main);
}();