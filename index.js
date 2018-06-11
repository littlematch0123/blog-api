const express = require('express')
const app = express()
const mongoose = require('mongoose')
// 对post请求的请求体及表单提交的信息进行解析
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send('博客系统API')
})
// 设置cors，处理跨域问题
const cors = require('cors')
app.use(cors({
  origin: 'https://xiaohuochai.cc',
  optionsSuccessStatus: 200
}))
// 开启后端服务
const { port } = require('./config')
app.listen(port, () => {
  console.log(`running on port${port}`)
})

// 连接数据库
const { uri } = require('./config')
mongoose.connect(uri)
const db = mongoose.connection
db.once('open', err => {
  if (err) {
    console.log('连接数据库失败')
  } else {
    console.log('连接数据库成功')
  }
})
// 加载七牛接口
require('./apis/qiniu')(app)
// 加载用户接口
require('./apis/user')(app)
// 加载认证接口
require('./apis/auth')(app)
// 加载文章接口
require('./apis/post')(app)
// 加载类别接口
require('./apis/category')(app)
// 加载点赞接口
require('./apis/like')(app)
// 加载评论接口
require('./apis/comment')(app)
