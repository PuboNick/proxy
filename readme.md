### 跨域请求代理

1.安装依赖 npm i

2.运行 node . [host-option] [session-id-option] [csrf_token]

host-option : *主机名，对应 uris 配置，默认为 production*
session-id-option: *可选，session-id*
csrf-token: *可选，csrf-token*

##### 示例

1.node .  production session-id csrf-token

2.node .

##### 动态设置接口

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

好用請給個Star


