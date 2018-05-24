# 项目说明

&emsp;&emsp;该项目是使用 express框架 和 mongodb数据库 开发的一套使用 RESTful 架构的博客系统API

【域名】

&emsp;&emsp;api.xiaohuochai.cc 
  

【功能模块】

&emsp;&emsp;功能包括认证、用户、类别、文章、评论、点赞和上传图片到七牛

&emsp;&emsp;1、认证(apis/auth)：手机号注册、用户名密码登录、手机验证码登录

&emsp;&emsp;2、用户(apis/user)：查询所有用户信息、查询当前用户信息、更新当前用户信息

&emsp;&emsp;3、类别(apis/category): 加载所有类别、新增类别、更新类别、删除类别

&emsp;&emsp;4、文章(apis/post): 加载所有文章、加载当前文章、新增文章、更新文章、删除文章

&emsp;&emsp;5、评论(apis/comment): 加载所有评论、增加评论、更新评论、删除评论

&emsp;&emsp;6、点赞(apis/like): 加载所有点赞、增加点赞、取消点赞

&emsp;&emsp;7、七牛(apis/qiniu): 获取七牛uploadToken


【Rest设计】

&emsp;&emsp;以文章操作为例

```
GET /posts：列出所有文章
POST /posts：新建一个文章
GET /posts/:id：获取某个指定文章的信息
PUT /posts/:id：更新某个指定文章的信息（提供该文章的全部信息）
DELETE /posts/:id：删除某个文章（提供该文章的全部信息）
GET /posts/:id/comments：列出某个指定文章的所有评论
DELETE /posts/:id/comments/:id：删除某个指定文章的指定评论
```

【HTTP状态码】

&emsp;&emsp;项目中使用到的HTTP状态码

```
200 请求成功【GET】
201 创建或修改或删除成功【POST/PUT/DELETE】
400 参数错误
401 未登录【令牌、用户名、密码错误】
403 禁止访问【权限不足】
404 资源未找到
500 服务器错误
```

【自定义状态码code】

&emsp;&emsp;项目中使用到的自定义状态码

```
0 成功
1 自定义失败
2 系统失败
3 认证失败
4 权限不足
```
【返回结构】

&emsp;&emsp;API返回结构设计如下，包括code、message、result或err
```
code 自定义状态码
message 说明信息
result 成功时的结果
err 失败时返回的结果
```

&emsp;&emsp;0、成功
```
{
  code: 0
  message: '',
  result: {}
}
```
&emsp;&emsp;1、自定义失败
```
{
  code: 1
  message: '自定义文字'
}
```
&emsp;&emsp;2、系统失败
```
{
  code: 2,
  message: err.message,
  err: {}
}
```
&emsp;&emsp;3、认证失败
```
{
  code: 3
  message: '认证失败'
}
```
&emsp;&emsp;4、权限不足
```
{
  code: 4
  message: '权限不足'
}
```


