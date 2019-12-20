### 跨域请求代理

1.安装依赖 npm i

2.新建文件上传时文件缓存文件夹 temp 

3.运行 node . [host-option] [session-id-option] [_csrf_token]

host-option : *主机名，对应 uris 配置，默认为 production* *session-id-option 可选，已存在的*

session-id:  *_csrf_token X-CSRF-TOKEN token值*

_csrf_token: *csrf检查TOKEN*

##### 示例

node .  production session-id csrf-token

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




