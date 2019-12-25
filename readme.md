### 跨域请求代理

1.安装依赖 npm i

2.运行 node . [host-option]

host-option : *主机名，对应 uris 配置，默认为 production*

##### 示例

示例1: node .  production

示例2: node .

##### 动态配置 Cookie&Token 接口

```javascript
{
    url: "_csrf"
    method: "GET",
    params: {
        token: "",
        cookie: ""
    }
}
```
##### 示例
http://127.0.0.1:8099/_csrf?token=xxx&cookie=***

##### .env 配置文件
SERVER_PORT 服務監聽地址
FILE_DIR 文件緩存地址
REFRESH 是否開啓刷新API (默認開啓)

##### urls.json 服務器地址選項配置文件
必須有 production 選項



