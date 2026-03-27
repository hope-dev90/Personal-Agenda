import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  isVerified: { type: Boolean, default: false },


  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },

  role: { type: String, default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);