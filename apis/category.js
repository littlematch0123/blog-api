// 加载categoryModel
const Category = require('../models/category')
// 加载管理员认证
const adminAuth = require('../utils/adminAuth')

module.exports = app => {
  /* 加载所有类别 */
  app.get('/categories', (req, res) => {
    Category.find().populate('posts', 'title').select('number name description recommend index').exec((err, docs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      return res.status(200).json({ code: 0, message: '获取类别成功', result: { docs } })
    })
  })

  /* 新增一个类别 */
  app.post('/categories', adminAuth, (req, res) => {
    new Category(req.body).save((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      doc.populate({ path: 'posts', select: 'title' }, (err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        return res.status(201).json({ code: 0, message: '新增成功', result: { doc } })
      })
    })
  })

  /* 按照number更新一种类别 */
  app.put('/categories/:number', adminAuth, (req, res) => {
    Category.findOne({ number: req.params.number }, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '类别不存在，请刷新后再试' })
      Object.entries(req.body).forEach(temp => {
        const [key, value] = temp
        doc[key] = value
      })
      doc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        doc.populate({ path: 'posts', select: 'title' }, (err, doc) => {
          if (err) return res.status(500).json({ code: 2, message: err.message, err })
          return res.status(201).json({ code: 0, message: '更新成功', result: { doc } })
        })
      })
    })
  })

  /* 按照number删除一种类别 */
  app.delete('/categories/:number', adminAuth, (req, res) => {
    Category.findOne({ number: req.params.number }, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '类别不存在，请刷新后再试' })
      doc.remove((err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        return res.status(201).json({ code: 0, message: '删除成功', result: { doc } })
      })
    })
  })
}
