const mongoose = require('mongoose')
const { Schema } = mongoose

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
    viewed: { type: Boolean, default: false },
    content: { type: String, required: true, validate: { validator: v => v.trim().length, message: '内容不能为空' } }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Comment', CommentSchema)
