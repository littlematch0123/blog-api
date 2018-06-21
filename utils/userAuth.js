const jwt = require('jsonwebtoken')
const jwtConfig = require('../config').jwt
const { secret } = jwtConfig

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ code: 3, message: '认证码失效，请重新登录' })
        }
        return res.status(401).json({ code: 3, message: '认证失败' })
      }
      if (decoded.test === true) {
        return res.status(403).json({ code: 4, message: '测试帐号只允许查看，不允许修改' })
      }
      next()      
    })
  } else {
    return res.status(401).json({ code: 3, message: '请提供认证码' })
  }
}

module.exports = adminAuth
