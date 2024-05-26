import mongoose from 'mongoose';

const gymFeedbackSchema = new mongoose.Schema(
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

    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
  },
  { timestamps: true }
);

export const managerFeedback = mongoose.model('gymFeedback', gymFeedbackSchema);
