import mongoose from 'mongoose';

const memberFeedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const memberFeedback = mongoose.model(
  'memberFeedback',
  memberFeedbackSchema
);
