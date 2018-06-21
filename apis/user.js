// 加载UserModel
const User = require('../models/user')
// 加载管理员认证
const adminAuth = require('../utils/adminAuth')

module.exports = app => {
  /* 获取当前用户详细信息 */
  app.get('/users/:id', (req, res) => {
    User.findById(req.params.id)
      .populate({ path: 'comments', select: 'createdAt post' })
      .populate({ path: 'likes', select: 'createdAt post' }).select('username').exec((err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        if (doc === null) return res.status(404).json({ code: 1, message: '用户不存在，请刷新后再试' })
        return res.status(200).json({ code: 0, message: '获取用户信息成功', result: { doc } })
      })
  })
  /* 更新当前用户信息 */
  app.put('/users/:id', adminAuth, (req, res) => {
    User.findById(req.params.id).exec((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '用户不存在，请刷新后再试' })
      Object.entries(req.body).forEach(temp => {
        const [key, value] = temp
        doc[key] = value
      })
      doc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        doc.populate([{ path: 'comments', select: 'createdAt post' }, { path: 'likes', select: 'createdAt post' }], (err, doc) => {
          if (err) return res.status(500).json({ code: 2, message: err.message, err })
          return res.status(201).json({ code: 0, message: '更新成功', result: { doc } })
        })
      })
    })
  })

  /* 加载所有用户 */
  app.get('/users', (req, res) => {
    User.find().select('username status likes comments').sort('-createdAt').exec((err, docs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      return res.status(200).json({ code: 0, message: '获取用户成功', result: { docs } })
    })
  })
}
