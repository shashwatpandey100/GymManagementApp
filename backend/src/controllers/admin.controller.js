import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Admin } from '../models/admin.model.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import { Gym } from '../models/gym.model.js';
import { Manager } from '../models/manager.model.js';
import jwt from 'jsonwebtoken';

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

const generateAccessAndRefreshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field === undefined || field === '')) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, 'We could not find a admin with that email');
  }

  const isPassowrdValid = await admin.isPasswordCorrect(password);
  if (!isPassowrdValid) {
    throw new ApiError(401, 'Incorrect password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id
  );

  const adminData = admin.toJSON();
  delete adminData.password;
  delete adminData.refreshToken;

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
        { admin: adminData, accessToken, refreshToken },
        'Admin logged in successfully'
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
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
    .json(new ApiResponse(200, {}, 'Admin logged out successfully'));
});

const refreshAccessTokenAdmin = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?._id);
    if (!admin) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (admin?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token expired');
    }

    const adminData = admin.toJSON();
    delete adminData.password;
    delete adminData.refreshToken;

    const options = {
      httpOnly: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      admin._id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { admin: adminData, accessToken, refreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const changePasswordAdmin = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (
    [oldPassword, newPassword].some(
      (field) => field === undefined || field === ''
    )
  ) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  validatePassword(newPassword);

  const admin = await Admin.findById(req.admin._id);

  const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Incorrect password');
  }

  admin.password = newPassword;
  await admin.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: req.admin },
        'Current admin fetched successfully'
      )
    );
});

const updateAdmin = asyncHandler(async (req, res) => {
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

  const admin = await Admin.findByIdAndUpdate(
    req.admin?._id,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, { admin }, 'Admin updated successfully'));
});

const updateAvatarAdmin = asyncHandler(async (req, res) => {
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

  const oldImagePublicId = req.admin.avatar
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.');
  await deleteFromCloudinary(oldImagePublicId);

  const admin = await Admin.findByIdAndUpdate(
    req.admin?._id,
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
        admin,
      },
      'Admin avatar updated successfully'
    )
  );
});

const getAllGyms = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 3;

  const totalGyms = await Gym.countDocuments();
  const totalPages = Math.ceil(totalGyms / pageSize);

  const gyms = await Gym.find()
    .populate('ownedBy', 'name email avatar')
    .select(
      'name subscriptionFee isSubscriptionValid isOnTrial trialStart trialEnd createdAt'
    )
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return res
    .status(200)
    .json(new ApiResponse(200, { gyms, totalPages }, 'Gyms fetched successfully'));
});

const searchGyms = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 10;

  const totalGyms = await Gym.countDocuments();
  const totalPages = Math.ceil(totalGyms / pageSize);

  if (!search) {
    throw new ApiError(400, 'Please provide a search query');
  }

  const gyms = await Gym.find({
    name: { $regex: search, $options: 'i' },
  })
    .populate('ownedBy', 'name email avatar')
    .select(
      'name subscriptionFee isSubscriptionValid isOnTrial trialStart trialEnd createdAt'
    )
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return res
    .status(200)
    .json(new ApiResponse(200, { gyms, totalPages }, 'Gyms fetched successfully'));
});

const deleteGym = asyncHandler(async (req, res) => {
  const { gymId } = req.query;

  if (!gymId) {
    throw new ApiError(400, 'Please provide a gym ID');
  }

  const gym = await Gym.findByIdAndDelete(gymId);

  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Gym deleted successfully'));
});

const getAllManagers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 10;

  const totalGyms = await Gym.countDocuments();
  const totalPages = Math.ceil(totalGyms / pageSize);

  const managers = await Manager.find().select(
    'name email gym phone avatar phoneCountryCode createdAt'
  )
  .skip((page - 1) * pageSize)
  .limit(pageSize);

  return res
    .status(200)
    .json(new ApiResponse(200, { managers, totalPages }, 'Managers fetched successfully'));
});

const searchManagers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 10;

  const totalGyms = await Gym.countDocuments();
  const totalPages = Math.ceil(totalGyms / pageSize);

  if (!search) {
    throw new ApiError(400, 'Please provide a search query');
  }

  const managers = await Manager.find({
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  }).select('name email gym phone avatar phoneCountryCode createdAt')
  .skip((page - 1) * pageSize)
  .limit(pageSize);

  return res
    .status(200)
    .json(new ApiResponse(200, { managers, totalPages }, 'Managers fetched successfully'));
});

const deleteManager = asyncHandler(async (req, res) => {
  const { managerId } = req.query;

  if (!managerId) {
    throw new ApiError(400, 'Please provide a manager ID');
  }

  const manager = await Manager.findByIdAndDelete(managerId);

  if (!manager) {
    throw new ApiError(404, 'Manager not found');
  }

  const oldImagePublicId = manager?.avatar
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.');
  await deleteFromCloudinary(oldImagePublicId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Manager deleted successfully'));
});

export {
  loginAdmin,
  logoutAdmin,
  refreshAccessTokenAdmin,
  changePasswordAdmin,
  getCurrentAdmin,
  updateAdmin,
  updateAvatarAdmin,
  getAllGyms,
  searchGyms,
  deleteGym,
  getAllManagers,
  searchManagers,
  deleteManager,
};
