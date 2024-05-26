import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'fullname is required'],
      minlength: [3, 'fullname must be atleast 3 characters long'],
      maxlength: [50, 'fullname must be atmost 50 characters long'],
      trim: true,
    },

    SubscriptionFee: {
      type: Number,
      default: 700,
      required: [true, 'SubscriptionFee is required'],
    },

    subscription: {
      isSubscriptionValid: {
        type: Boolean,
        default: false,
      },
  
      subscriptionStart: {
        type: Date,
        required: function () {
          return this.isSubscriptionValid;
        },
      },
  
      subscriptionEnd: {
        type: Date,
        required: function () {
          return this.isSubscriptionValid;
        },
      },

      subscriptionDurationMonths: {
        // in months
        type: Number,
        required: function () {
          return this.isSubscriptionValid;
        },
      },
    },

    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'owner is required'],
      ref: 'Manager',
    }, 

    address: {
      type: String,
      required: [true, 'address is required'],
      maxlength: [320, 'address must be atmost 320 characters long'],
      trim: true,
    },

    workers: [
      {
        name: {
          type: String,
          required: [true, 'fullname is required'],
          minlength: [3, 'fullname must be atleast 3 characters long'],
          maxlength: [50, 'fullname must be atmost 50 characters long'],
          trim: true,
        },
        post: {
          type: String,
          required: true,
        },
        salary: {
          type: Number,
          required: true,
        },
        phone: {
          countryCode: {
            type: String,
            required: true,
          },
          phoneNumber: {
            type: String,
            required: true,
          },
        },
        address: {
          type: String,
          maxlength: [520, 'address must be atmost 520 characters long'],
        },
      },
    ],

    memberships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
      },
    ],

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],

    isOnTrial: {
      type: Boolean,
      default: false,
    },

    trialStart: {
      type: Date,
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

export const Gym = mongoose.model('Gym', gymSchema);
