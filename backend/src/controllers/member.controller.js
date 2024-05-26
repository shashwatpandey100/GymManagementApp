import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Member } from '../models/member.model.js';
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

const generateAccessAndRefreshToken = async (memberId) => {
  try {
    const member = await Member.findById(memberId);
    const accessToken = member.generateAccessToken();
    const refreshToken = member.generateRefreshToken();

    member.refreshToken = refreshToken;
    await member.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const loginMember = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field === undefined || field === '')) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  const member = await Member.findOne({ email });
  if (!member) {
    throw new ApiError(404, 'We could not find a member with that email');
  }

  const isPassowrdValid = await member.isPasswordCorrect(password);
  if (!isPassowrdValid) {
    throw new ApiError(401, 'Incorrect password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    member._id
  );

  const memberData = member.toJSON();
  delete memberData.password;
  delete memberData.refreshToken;

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
        { member: memberData, accessToken, refreshToken },
        'Member logged in successfully'
      )
    );
});

const logoutMember = asyncHandler(async (req, res) => {
  await Member.findByIdAndUpdate(
    req.member._id,
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
    .json(new ApiResponse(200, {}, 'Member logged out successfully'));
});

const refreshAccessTokenMember = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const member = await Member.findById(decodedToken?._id);
    if (!member) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (member?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token expired');
    }

    const memberData = member.toJSON();
    delete memberData.password;
    delete memberData.refreshToken;

    const options = {
      httpOnly: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      member._id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { member: memberData, accessToken, refreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const changePasswordMember = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (
    [oldPassword, newPassword].some(
      (field) => field === undefined || field === ''
    )
  ) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  validatePassword(newPassword);

  const member = await Member.findById(req.member._id);

  const isPasswordCorrect = await member.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Incorrect password');
  }

  member.password = newPassword;
  await member.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentMember = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { member: req.member },
        'Current member fetched successfully'
      )
    );
});

const updateMember = asyncHandler(async (req, res) => {
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

  const member = await Member.findByIdAndUpdate(
    req.member?._id,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, { member }, 'Member updated successfully'));
});

const updateAvatarMember = asyncHandler(async (req, res) => {
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

  const oldImagePublicId = req.member.avatar
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.');
  await deleteFromCloudinary(oldImagePublicId);

  const member = await Member.findByIdAndUpdate(
    req.member?._id,
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
        member,
      },
      'Member avatar updated successfully'
    )
  );
});

export {
  loginMember,
  logoutMember,
  refreshAccessTokenMember,
  changePasswordMember,
  getCurrentMember,
  updateMember,
  updateAvatarMember,
};
