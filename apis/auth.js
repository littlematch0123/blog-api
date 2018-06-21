// 加载UserModel
const User = require('../models/user')
// 加载jwt
const jwt = require('jsonwebtoken')
// 加载jwt相关配置
const jwtConfig = require('../config').jwt
// 加载密码和token过期时间
const { secret, expiresIn } = jwtConfig
// 生成token
const generateToken = user => jwt.sign(user, secret, { expiresIn })
// 加载短信服务
const SMSClient = require('@alicloud/sms-sdk')
// 加载短信服务相关配置
const smsConfig = require('../config').sms
// 加载短信服务的id、key、短信模板、短信模板名称
const { accessKeyId, secretAccessKey, TemplateCode, SignName } = smsConfig
// 加载验证函数
const { isEmpty, isPhoneNumber, isOneChineseCharacter, isLengthElt20, isSixDigits } = require('../utils/fnVerificate')

// 初始化sms_client
const smsClient = new SMSClient({ accessKeyId, secretAccessKey })

module.exports = app => {
  /* 用户注册 */
  app.post('/auth/signup', (req, res) => {
    const { phoneNumber, username, password } = req.body
    // 判断该手机号码是否符合规范
    if (!isPhoneNumber(phoneNumber)) return res.status(400).json({ code: 1, message: '手机号无效' })
    // 查找该手机号码是否已经注册
    User.findOne({ phoneNumber }, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      // 如果找到，则无法再次注册
      if (doc) {
        // 判断该手机号是否存在验证码，如果存在，提示1分钟内无法再次提交注册，否则，提示已注册
        if (doc.verificationCode) {
          return res.status(400).json({ code: 1, message: '1分钟内无法再次提交注册' })
        }
        return res.status(400).json({ code: 1, message: '该手机号已注册，请直接登录' })
      }
      // 接下来，测试用户名是否符合单一汉字的原则
      if (!isOneChineseCharacter(username)) return res.status(400).json({ code: 1, message: '用户名无效' })
      // 查找该用户名是否已被使用
      User.findOne({ username }, (err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        // 如果找到，则无法再次注册
        if (doc) return res.status(400).json({ code: 1, message: '该用户名已被注册，请更换其他汉字' })
        // 接下来，检测密码是否小于20位
        if (!isLengthElt20(password)) return res.status(400).json({ code: 1, message: '密码超出支持位数' })
        // 获取6位随机数
        const verificationCode = String(Math.random()).slice(-6).padStart(6, '0')
        // 发送短信
        smsClient.sendSMS({
          PhoneNumbers: phoneNumber,
          SignName,
          TemplateCode,
          TemplateParam: JSON.stringify({ code: verificationCode })
        }).then(response => {
          // 如果验证码发送成功，则新建用户，保存其用户信息到数据库
          if (response.Code === 'OK') {
            const user = new User({ phoneNumber, verificationCode, username, password })
            user.save(err => {
              if (err) { return res.status(500).json({ code: 2, message: err.message, err }) }
              return res.status(201).json({ code: 0, message: '验证码已发送', result: { doSendVerificationCode: true } })
            })
            // 一分钟后，再次查找该用户，如果用户的验证码不为空，表示验证过期，则删除该用户
            setTimeout(() => {
              User.findOne({ phoneNumber }).then(
                doc => { doc.verificationCode && doc.remove() },
                err => {
                  if (err) {
                    return res.status(500).json({ code: 2, message: err.message, err })
                  }
                }
              )
            }, 60000)
          }
        }, err => { if (err) return res.status(500).json({ code: 2, message: err.message, err }) })
      })
    })
  })

  /* 验证码验证 */
  app.post('/auth/verificate', (req, res) => {
    const { verificationCode } = req.body
    // 测试验证码是不是6位整数
    if (!isSixDigits(verificationCode)) { return res.status(401).json({ code: 1, message: '验证码是6位数字' }) }
    // 从数据库中查找是否有该验证码的用户
    User.findOne({ verificationCode }).then(
      doc => {
        // 如果找到了，则删除该验证码
        if (doc) {
          doc.verificationCode = ''
          const { username, _id, test } = doc
          doc.save()
          if (!doc.status) {
            return res.status(403).json({
              code: 1,
              message: '由于您的不当操作，帐号已被停用。如有问题，请发邮件到121631835@qq.com'
            })
          }
          return res.status(201).json({ code: 0, message: '验证成功', result: { token: generateToken({ username, test }), user: { username, _id } } })
          // 如果没有找到，则验证码无效
        }
        return res.status(401).json({ code: 1, message: '验证码无效' })
      },
      err => res.status(500).json({ code: 2, message: err.message, err })
    )
  })

  /* 用户名密码登录 */
  app.post('/auth/signin_by_username', (req, res) => {
    const { username, password } = req.body
    // 测试用户名是否符合单一汉字的原则
    if (!isOneChineseCharacter(username)) return res.status(400).json({ code: 1, message: '用户名无效' })
    // 检测密码是否为空
    if (isEmpty(password)) return res.status(400).json({ code: 1, message: '密码不得为空' })
    // 检测密码是否小于20位
    if (!isLengthElt20(password)) return res.status(400).json({ code: 1, message: '密码超出支持位数' })
    User.findOne({ username }, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(400).json({ code: 1, message: '用户名不存在' })
      doc.comparePassword(password, (err, isMatch) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        if (!isMatch) return res.status(401).json({ code: 1, message: '密码无效' })
        const { _id, test } = doc
        if (!doc.status) {
          return res.status(403).json({
            code: 1,
            message: '由于您的不当操作，帐号已被停用。如有问题，请发邮件到121631835@qq.com'
          })
        }
        return res.status(201).json({ code: 0, message: '登录成功', result: { token: generateToken({ username, test }), user: { username, _id } } })
      })
    })
  })

  /* 手机号登录 */
  app.post('/auth/signin_by_phonenumber', (req, res) => {
    const { phoneNumber } = req.body
    // 判断该手机号码是否符合规范
    if (!isPhoneNumber(phoneNumber)) return res.status(400).json({ code: 1, message: '手机号无效' })
    User.findOne({ phoneNumber }, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(400).json({ code: 1, message: '该手机号未注册' })
      // 获取6位随机数
      const verificationCode = String(Math.random()).slice(-6).padStart(6, '0')
      // 发送短信
      smsClient.sendSMS({
        PhoneNumbers: phoneNumber,
        SignName,
        TemplateCode,
        TemplateParam: JSON.stringify({ code: verificationCode })
      }).then(response => {
        // 如果验证码发送成功，则保存验证码到数据库
        if (response.Code === 'OK') {
          doc.verificationCode = verificationCode
          doc.save()
          // 一分钟后，将用户的验证码置空
          setTimeout(() => {
            User.findOne({ phoneNumber }, (err, doc) => {
              doc.verificationCode = ''
              doc.save()
            })
          }, 60000)
          return res.status(201).json({ code: 0, message: '验证码已发送', result: { doSendVerificationCode: true } })
        }
      }, err => { if (err) return res.status(500).json({ code: 2, message: err.message, err }) })
    })
  })

  /* 管理员登录 */
  app.post('/auth/admin', (req, res) => {
    const { username, password } = req.body
    User.findOne({ username, admin: true }, (err, user) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (user === null) return res.status(404).json({ code: 1, message: '管理员不存在' })
      user.comparePassword(password, (err, isMatch) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        if (!isMatch) return res.status(401).json({ code: 1, message: '密码无效' })
        const { admin, test, _id } = user
        return res.status(201).json({ code: 0, message: '登录成功', result: { token: generateToken({ username, admin, test }), user: { username, _id } } })
      })
    })
  })
}
