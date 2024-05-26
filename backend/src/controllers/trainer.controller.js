import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Trainer } from '../models/trainer.model.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const validatePassword = (password) => {
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new ApiError(
      400,
      'Password must contain at least one uppercase letter'
    );
  }
  if (!/\d/.test(password)) {
    throw new ApiError(400, 'Password must contain at least one digit');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    throw new ApiError(
      400,
      'Password must contain at least one special character'
    );
  }
};

const generateAccessAndRefreshToken = async (trainerId) => {
  try {
    const trainer = await Trainer.findById(trainerId);
    const accessToken = trainer.generateAccessToken();
    const refreshToken = trainer.generateRefreshToken();

    trainer.refreshToken = refreshToken;
    await trainer.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const loginTrainer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field === undefined || field === '')) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  const trainer = await Trainer.findOne({ email });
  if (!trainer) {
    throw new ApiError(404, 'We could not find a trainer with that email');
  }

  const isPassowrdValid = await trainer.isPasswordCorrect(password);
  if (!isPassowrdValid) {
    throw new ApiError(401, 'Incorrect password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    trainer._id
  );

  const trainerData = trainer.toJSON();
  delete trainerData.password;
  delete trainerData.refreshToken;

  const options = {
    httpOnly: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { trainer: trainerData, accessToken, refreshToken },
        'Trainer logged in successfully'
      )
    );
});

const logoutTrainer = asyncHandler(async (req, res) => {
  await Trainer.findByIdAndUpdate(
    req.trainer._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'Trainer logged out successfully'));
});

const refreshAccessTokenTrainer = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const trainer = await Trainer.findById(decodedToken?._id);
    if (!trainer) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (trainer?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token expired');
    }

    const trainerData = trainer.toJSON();
    delete trainerData.password;
    delete trainerData.refreshToken;

    const options = {
      httpOnly: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      trainer._id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { trainer: trainerData, accessToken, refreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const changePasswordTrainer = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (
    [oldPassword, newPassword].some(
      (field) => field === undefined || field === ''
    )
  ) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  validatePassword(newPassword);

  const trainer = await Trainer.findById(req.trainer._id);

  const isPasswordCorrect = await trainer.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Incorrect password');
  }

  trainer.password = newPassword;
  await trainer.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentTrainer = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { trainer: req.trainer },
        'Current trainer fetched successfully'
      )
    );
});

const updateTrainer = asyncHandler(async (req, res) => {
  const { name, phone, phoneCountryCode } = req.body;

  if (!name && !phone && !phoneCountryCode) {
    throw new ApiError(400, 'Please provide at least one field to update');
  }

  const updateFields = {};

  if (name !== undefined || name !== '') {
    updateFields.name = name;
  }
  if (phone !== undefined || phone !== '') {
    updateFields.phone = phone;
  }
  if (phoneCountryCode !== undefined || phoneCountryCode !== '') {
    updateFields.phoneCountryCode = phoneCountryCode;
  }

  const trainer = await Trainer.findByIdAndUpdate(
    req.trainer?._id,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, { trainer }, 'Trainer updated successfully'));
});

const updateAvatarTrainer = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Please provide an avatar to update');
  }

  let avatar;
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  if (!avatar.url) {
    throw new ApiError(500, 'Something went wrong while uploading avatar');
  }

  const oldImagePublicId = req.trainer.avatar
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.');
  await deleteFromCloudinary(oldImagePublicId);

  const trainer = await Trainer.findByIdAndUpdate(
    req.trainer?._id,
    {
      $set: {
        avatar: avatar?.url || DEFAULT_PROFILE,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        trainer,
      },
      'Member avatar updated successfully'
    )
  );
});


export {
  loginTrainer,
  logoutTrainer,
  refreshAccessTokenTrainer,
  changePasswordTrainer,
  getCurrentTrainer,
  updateTrainer,
  updateAvatarTrainer,
};
