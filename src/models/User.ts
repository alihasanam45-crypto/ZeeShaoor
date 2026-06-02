import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Teacher', 'Student', 'Parent'], 
    default: 'Student' 
  },
  isPremium: { type: Boolean, default: false },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;