const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const UserSchema = new Schema(
  {
    username: { type: String, match: /^[\u4e00-\u9fa5]$/, unique: true },
    password: { type: String },
    admin: { type: Boolean, default: false },
    phoneNumber: { type: Number, match: /^(13\d|14[579]|15[0-35-9]|17[0135-8]|18\d)\d{8}$/ },
    verificationCode: { type: String, match: /^\d{6}$/ },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    status: { type: Boolean, default: true },
    test: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const SALT_WORK_FACTOR = 5
UserSchema.pre('save', function fn(next) {
  const user = this
  // 产生密码hash当密码有更改的时候(或者是新密码)
  if (!user.isModified('password')) return next()
  // 产生一个salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    //  结合salt产生新的hash
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      // 使用hash覆盖明文密码
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function fn(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}
module.exports = mongoose.model('User', UserSchema)
