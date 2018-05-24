const qiniu = require('qiniu')
const qiniuConfig = require('../config').qiniu
const { accessKey, secretKey, expires, scope } = qiniuConfig
const options = { scope, expires }

module.exports = app => {
  /* 发送uploadToken */
  app.get('/qiniu', (req, res) => {
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
    return res.status(200).json({ code: 0, message: '获取token成功', result: { doc: uploadToken } })
  })
}
