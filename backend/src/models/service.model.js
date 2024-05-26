import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      minlength: [3, 'name must be atleast 3 characters long'],
      maxlength: [50, 'name must be atmost 50 characters long'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      minlength: [3, 'description must be atleast 3 characters long'],
      maxlength: [320, 'description must be atmost 320 characters long'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price must be atleast 0'],
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
