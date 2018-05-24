const mongoose = require('mongoose')
const { Schema } = mongoose

const CategorySchema = new Schema(
  {
    number: { type: Number, required: true, index: true, unique: true, min: [1000000000, '位数不足'], max: [9999999999, '位数过长'] },
    name: { type: String, required: true, validate: { validator: v => v.trim().length, message: '名称不能为空' } },
    description: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    recommend: { type: Boolean },
    index: { type: Number }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', CategorySchema)
