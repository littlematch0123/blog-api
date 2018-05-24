// 加载postModel
const Post = require('../models/post')
// 加载CategoryModel
const Category = require('../models/category')
// 加载管理员认证
const adminAuth = require('../utils/adminAuth')

// 关联category的posts数组
const fnRelatedCategory = (_id, res) => {
  Category.findById(_id).exec((err, categoryDoc) => {
    if (err) return res.status(500).json({ code: 2, message: err.message, err })
    if (categoryDoc === null) return res.status(404).json({ code: 1, message: '该类别不存在，请刷新后再试' })
    Post.find({ category: _id }).exec((err, postsDocs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      categoryDoc.posts = postsDocs.map(t => t._id)
      categoryDoc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
      })
    })
  })
}

module.exports = app => {
  /* 按照id加载一篇文章 */
  app.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id).populate('category', 'number').exec((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '文章不存在' })
      return res.status(200).json({ code: 0, message: '获取文章成功', result: { doc } })
    })
  })

  /* 加载所有文章 */
  app.get('/posts', (req, res) => {
    Post.find().select('title likes comments recommend imgUrl index').populate('category', 'number').sort('-createdAt').exec((err, docs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      return res.status(200).json({ code: 0, message: '获取文章成功', result: { docs } })
    })
  })

  /* 新增一篇文章 */
  app.post('/posts', adminAuth, (req, res) => {
    new Post(req.body).save((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      doc.populate({ path: 'category', select: 'number' }, (err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        fnRelatedCategory(doc.category._id, res)
        return res.status(201).json({ code: 0, message: '新增成功', result: { doc } })
      })
    })
  })

  /* 按照id更新一篇文章 */
  app.put('/posts/:id', adminAuth, (req, res) => {
    Post.findById(req.params.id).exec((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '文章不存在，请刷新后再试' })
      Object.entries(req.body).forEach(temp => {
        const [key, value] = temp
        doc[key] = value
      })
      doc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        doc.populate({ path: 'category', select: 'number' }, (err, doc) => {
          if (err) return res.status(500).json({ code: 2, message: err.message, err })
          fnRelatedCategory(doc.category._id, res)
          return res.status(201).json({ code: 0, message: '更新成功', result: { doc } })
        })
      })
    })
  })

  /* 按照id删除一篇文章 */
  app.delete('/posts/:id', adminAuth, (req, res) => {
    console.log(req.params)
    Post.findById(req.params.id, (err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: '删除文章出错', err })
      if (doc === null) return res.status(404).json({ code: 1, message: '文章不存在，请刷新后再试' })
      doc.remove((err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        fnRelatedCategory(doc.category, res)
        return res.status(201).json({ code: 0, message: '删除成功', result: { doc } })
      })
    })
  })
}
