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
      if (decoded.admin === true) {
        next()
      } else {
        return res.status(401).json({ code: 3, message: '认证失败' })
      }
    })
  } else {
    return res.status(401).json({ code: 3, message: '请提供认证码' })
  }
}

module.exports = adminAuth
