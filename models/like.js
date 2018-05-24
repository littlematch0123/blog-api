const mongoose = require('mongoose')
const { Schema } = mongoose

const LikeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Like', LikeSchema)
