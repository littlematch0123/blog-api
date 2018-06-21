// 加载likeModel
const Like = require('../models/like')
// 加载postModel
const Post = require('../models/post')
// 加载userModel
const User = require('../models/user')
// 加载用户认证
const userAuth = require('../utils/userAuth')
// 关联post的likes数组
const fnRelatedPost = (_id, res) => {
  Post.findById(_id).exec((err, postDoc) => {
    if (err) return res.status(500).json({ code: 2, message: err.message, err })
    if (postDoc === null) return res.status(404).json({ code: 1, message: '该文章不存在，请刷新后再试' })
    Like.find({ post: _id }).exec((err, likesDocs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      postDoc.likes = likesDocs.map(t => t._id)
      postDoc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
      })
    })
  })
}
// 关联user的likes数组
const fnRelatedUser = (_id, res) => {
  User.findById(_id).exec((err, userDoc) => {
    if (err) return res.status(500).json({ code: 2, message: err.message, err })
    if (userDoc === null) return res.status(404).json({ code: 1, message: '该用户不存在，请刷新后再试' })
    Like.find({ user: _id }).exec((err, likesDocs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      userDoc.likes = likesDocs.map(t => t._id)
      userDoc.save(err => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
      })
    })
  })
}

module.exports = app => {
  /* 加载所有点赞 */
  app.get('/likes', (req, res) => {
    Like.find().select('user createdAt').populate('post', 'title').populate('user', 'username').sort('-createdAt').exec((err, docs) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      return res.status(200).json({ code: 0, message: '获取点赞成功', result: { docs } })
    })
  })

  /* 增加一次点赞 */
  app.post('/likes', userAuth, (req, res) => {
    new Like(req.body).save((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      doc.populate([{ path: 'user', select: 'username' }, { path: 'post', select: 'title' }], (err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        fnRelatedPost(doc.post._id, res)
        fnRelatedUser(doc.user._id, res)
        return res.status(201).json({ code: 0, message: '点赞成功', result: { doc } })
      })
    })
  })

  /* 按照id取消一次点赞 */
  app.delete('/likes/:id', userAuth, (req, res) => {
    Like.findById(req.params.id).exec((err, doc) => {
      if (err) return res.status(500).json({ code: 2, message: err.message, err })
      if (doc === null) return res.status(404).json({ code: 1, message: '点赞不存在，请刷新后再试' })
      doc.remove((err, doc) => {
        if (err) return res.status(500).json({ code: 2, message: err.message, err })
        fnRelatedPost(doc.post._id, res)
        fnRelatedUser(doc.user._id, res)
        return res.status(201).json({ code: 0, message: '取消点赞成功', result: { doc } })
      })
    })
  })
}
