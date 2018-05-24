const mongoose = require('mongoose')
const { Schema } = mongoose

const PostSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    content: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    imgUrl: { type: String },
    recommend: { type: Boolean },
    index: { type: Number }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Post', PostSchema)
