import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DEFAULT_PROFILE } from '../constants.js';

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'fullname is required'],
      minlength: [3, 'fullname must be atleast 3 characters long'],
      maxlength: [50, 'fullname must be atmost 50 characters long'],
      trim: true,
    },
    
    DOB: {
      type: Date,
    },

    role: {
      type: String,
      default: 'member',
      immutable: true,
    },

    email: {
      type: String,
      required: [true, 'email is required'],
      unique: [true, 'email already exists'],
      minlength: [6, 'email must be atleast 6 characters long'],
      maxlength: [320, 'email must be atmost 320 characters long'],
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: [6, 'password must be atleast 6 characters long'],
      maxlength: [1024, 'password must be atmost 1024 characters long'],
    },

    refreshToken: {
      type: String,
    },

    avatar: {
      type: String,
      default: DEFAULT_PROFILE,
    },

    phoneCountryCode: {
      type: String,
      default: '+91',
    },

    phone: {
      type: String,
      required: [true, 'phone number is required'],
    },

    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'gym is required'],
    },

    fees: {
      type: Number,
      required: [true, 'fees is required'],
      min: [0, 'fees must be atleast 0'],
    },

    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
    },

    personalTrainer: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        trainer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Trainer',
        },
      },
    ],

    isOnTrial: {
      type: Boolean,
      default: false,
    },
    trialStart: {
      type: Date,
      default: Date.now(),
      required: function () {
        return this.isOnTrial; 
      },
    },
    trialEnd: {
      type: Date,
      required: function () {
        return this.isOnTrial; 
      },
    },
    isConverted: {
      type: Boolean,
      default: false,
      required: function () {
        return this.isOnTrial; 
      },
    },
  },
  { timestamps: true }
);

memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

memberSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

memberSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          name: this.name,
          email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}

memberSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Member = mongoose.model('Member', memberSchema);
