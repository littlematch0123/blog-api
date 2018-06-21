// 加载CommentModel
const Comment = require('../models/comment')
// 加载PostModel
const Post = require('../models/post')
// 加载UserModel
const User = require('../models/user')
// 加载用户认证
const userAuth = require('../utils/userAuth')

// 关联post的comments数组
const fnRelatedPost = (_id, res) => {
  Post.findById(_id).exec((err, postDoc) => {
    if (err) return res.status(500).json({ code: 2, message: err.message, err })
    if (postDoc === null) return res.status(404).json({ code: 1, message: '该文章不存在，请刷新后再试' })
    Comment.find({ post: _id }).exec((err, commentsDocs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      postDoc.comments = commentsDocs.map(t => t._id)
      postDoc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
      })
    })
  })
}
// 关联user的comments数组
const fnRelatedUser = (_id, res) => {
  User.findById(_id).exec((err, userDoc) => {
    if (err) return res.status(500).json({ code: 2, message: err.message, err })
    if (userDoc === null) return res.status(404).json({ code: 1, message: '该用户不存在，请刷新后再试' })
    Comment.find({ user: _id }).exec((err, commentsDocs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      userDoc.comments = commentsDocs.map(t => t._id)
      userDoc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
      })
    })
  })
}
module.exports = app => {
  /* 加载所有评论 */
  app.get('/comments', (req, res) => {
    Comment.find().select('content createdAt viewed').populate('user', 'username').populate('post', 'title').sort('-createdAt').exec((err, docs) => {
      if (err) return res.status(500).json({ code: 0, message: err.message, err })
      return res.status(200).json({ code: 0, message: '获取评论成功', result: { docs } })
    })
  })

  /* 增加一个评论 */
  app.post('/comments', userAuth, (req, res) => {
    new Comment(req.body).save((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      doc.populate([{ path: 'user', select: 'username' }, { path: 'post', select: 'title' }], (err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        fnRelatedPost(doc.post._id, res)
        fnRelatedUser(doc.user._id, res)
        return res.status(201).json({ code: 0, message: '添加成功', result: { doc } })
      })
    })
  })

  /* 按照id更新一个评论 */
  app.put('/comments/:id', userAuth, (req, res) => {
    Comment.findById(req.params.id).exec((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '评论不存在，请刷新后再试' })
      Object.entries(req.body).forEach(temp => {
        const [key, value] = temp
        doc[key] = value
      })
      doc.save((err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        doc.populate([{ path: 'user', select: 'username' }, { path: 'post', select: 'title' }], (err, doc) => {
          if (err) return res.status(500).json({ code: 2, message: err.message, err })
          fnRelatedPost(doc.post._id, res)
          fnRelatedUser(doc.user._id, res)
          return res.status(201).json({ code: 0, message: '更新成功', result: { doc } })
        })
      })
    })
  })

  /* 按照id删除一个评论 */
  app.delete('/comments/:id', userAuth, (req, res) => {
    Comment.findById(req.params.id).exec((err, doc) => {
      if (err) return res.status(500).json({ code: 0, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '评论不存在，请刷新后再试' })
      doc.remove((err, doc) => {
        if (err) return res.status(500).json({ code: 0, message: err.message, err })
        fnRelatedPost(doc.post._id, res)
        fnRelatedUser(doc.user._id, res)
        return res.status(201).json({ code: 0, message: '删除成功', result: { doc } })
      })
    })
  })
}
