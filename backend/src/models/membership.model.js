import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Gym is required'],
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },

    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model(
  'MembershipPlan',
  membershipPlanSchema
);
