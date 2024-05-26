import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Manager } from '../models/manager.model.js';
import { Member } from '../models/member.model.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { DEFAULT_PROFILE } from '../constants.js';
import jwt from 'jsonwebtoken';
import { Gym } from '../models/gym.model.js';
import { Trainer } from '../models/trainer.model.js';
import { MembershipPlan } from '../models/membership.model.js';
import { Notice } from '../models/notice.model.js';

// jab gym banaye to uska khud ke attribute me gym add karna

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new ApiError(400, 'Invalid email address');
  }
};

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

const generateAccessAndRefreshToken = async (managerId) => {
  try {
    const manager = await Manager.findById(managerId);
    const accessToken = manager.generateAccessToken();
    const refreshToken = manager.generateRefreshToken();

    manager.refreshToken = refreshToken;
    await manager.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const registerManager = asyncHandler(async (req, res) => {
  const { name, email, password, phone, phoneCountryCode } = req.body;

  if (
    [name, email, password, phone].some(
      (field) => field === undefined || field?.trim === ''
    )
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  validateEmail(email);
  validatePassword(password);

  const userExists = await Manager.findOne({ email });
  if (userExists) {
    throw new ApiError(409, 'Email already exists');
  }

  let avatarLocalPath;
  if (req.file) {
    avatarLocalPath = req.file.path;
  }

  let avatar;
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  const manager = await Manager.create({
    name,
    email,
    password,
    phone,
    phoneCountryCode,
    avatar: avatar?.url,
  });

  const createdManager = await Manager.findById(manager._id).select(
    '-password -refreshToken'
  );

  if (!createdManager) {
    throw new ApiError(500, 'Something went wrong while registering manager');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdManager, 'Manager created successfully'));
});

const loginManager = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field === undefined || field === '')) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  const manager = await Manager.findOne({ email });
  if (!manager) {
    throw new ApiError(404, 'We could not find a manager with that email');
  }

  const isPassowrdValid = await manager.isPasswordCorrect(password);
  if (!isPassowrdValid) {
    throw new ApiError(401, 'Incorrect password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    manager._id
  );

  const managerData = manager.toJSON();
  delete managerData.password;
  delete managerData.refreshToken;

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
        { manager: managerData, accessToken, refreshToken },
        'Manager logged in successfully'
      )
    );
});

const logoutManager = asyncHandler(async (req, res) => {
  await Manager.findByIdAndUpdate(
    req.manager._id,
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
    .json(new ApiResponse(200, {}, 'Manager logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const manager = await Manager.findById(decodedToken?._id);
    if (!manager) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (manager?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token expired');
    }

    const managerData = manager.toJSON();
    delete managerData.password;
    delete managerData.refreshToken;

    const options = {
      httpOnly: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      manager._id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { manager: managerData, accessToken, refreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const createMember = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    phoneCountryCode,
    gym,
    fees,
    membershipPlan,
    personalTrainer,
    isOnTrial,
    trialStart,
    trialEnd,
    isConverted,
  } = req.body;

  if (
    [name, email, password, phone, gym, fees].some(
      (field) => field === undefined || field?.trim === ''
    )
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  validateEmail(email);
  validatePassword(password);

  const memberExists = await Member.findOne({ email });
  if (memberExists) {
    throw new ApiError(409, 'Member already exists');
  }

  const member = await Member.create({
    name,
    email,
    password,
    phone,
    phoneCountryCode,
    gym,
    fees,
    membershipPlan,
    personalTrainer,
    isOnTrial,
    trialStart,
    trialEnd,
    isConverted,
  });

  const createdMember = await Member.findById(member._id).select(
    '-password -refreshToken'
  );

  if (!createdMember) {
    throw new ApiError(500, 'Something went wrong while registering member');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdMember, 'Member created successfully'));
});

const createGym = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    subscriptionFee,
    workers,
    memberships,
    services,
    isOnTrial,
    trialStart,
    trialEnd,
    isConverted,
  } = req.body;

  if (
    [name, address].some((field) => field === undefined || field?.trim === '')
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  const gymExists = await Member.findOne({ name });
  if (gymExists) {
    throw new ApiError(409, `gym with name '${name}' already exists`);
  }

  const gym = await Gym.create({
    name,
    subscriptionFee,
    ownedBy: req.manager._id,
    address,
    workers,
    memberships,
    services,
    isOnTrial,
    trialStart,
    trialEnd,
    isConverted,
  });

  const createdGym = await Gym.findById(gym._id);

  if (!createdGym) {
    throw new ApiError(500, 'Something went wrong while creating gym');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdGym, 'Gym created successfully'));
});

const createTrainer = asyncHandler(async (req, res) => {
  const { name, email, password, phone, phoneCountryCode, gym } = req.body;

  if (
    [name, email, password, phone, gym].some(
      (field) => field === undefined || field?.trim === ''
    )
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  validateEmail(email);
  validatePassword(password);

  const trainerExists = await Trainer.findOne({ email });
  if (trainerExists) {
    throw new ApiError(409, 'Trainer already exists');
  }

  const trainer = await Trainer.create({
    name,
    email,
    password,
    phone,
    phoneCountryCode,
    gym,
  });

  const createdTrainer = await Trainer.findById(trainer._id).select(
    '-password -refreshToken'
  );

  if (!createdTrainer) {
    throw new ApiError(500, 'Something went wrong while creating trainer');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdTrainer, 'Trainer created successfully'));
});

const createMembershipPlan = asyncHandler(async (req, res) => {
  const { gym, name, description, price, duration } = req.body;

  if (
    [name, description, price, duration].some(
      (field) => field === undefined || field?.trim === ''
    )
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  const membershipPlan = await MembershipPlan.create({
    gym,
    name,
    description,
    price,
    duration,
  });

  const createdMembershipPlan = await MembershipPlan.findById(
    membershipPlan._id
  );

  if (!createdMembershipPlan) {
    throw new ApiError(
      500,
      'Something went wrong while creating membership plan'
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdMembershipPlan,
        'Membership Plan created successfully'
      )
    );
});

const createNotice = asyncHandler(async (req, res) => {
  const { gym, title, details } = req.body;

  if (
    [gym, title, details].some(
      (field) => field === undefined || field?.trim === ''
    )
  ) {
    throw new ApiError(400, 'please fill all required fields!');
  }

  const notice = await Notice.create({
    gym,
    title,
    details,
  });

  const createdNotice = await Notice.findById(notice._id);

  if (!createNotice) {
    throw new ApiError(500, 'Something went wrong while creating notice');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdNotice, 'Notice added successfully'));
});

const changePasswordManager = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (
    [oldPassword, newPassword].some(
      (field) => field === undefined || field === ''
    )
  ) {
    throw new ApiError(400, 'Please fill all required fields!');
  }

  validatePassword(newPassword);

  const manager = await Manager.findById(req.manager._id);

  const isPasswordCorrect = await manager.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Incorrect password');
  }

  manager.password = newPassword;
  await manager.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentManager = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { manager: req.manager },
        'Current manager fetched successfully'
      )
    );
});

const updateManager = asyncHandler(async (req, res) => {
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

  const manager = await Manager.findByIdAndUpdate(
    req.manager?._id,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, { manager }, 'Manager updated successfully'));
});

const updateAvatarManager = asyncHandler(async (req, res) => {
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

  const oldImagePublicId = req.manager.avatar.split('/').pop().split('.').slice(0, -1).join('.');
  await deleteFromCloudinary(oldImagePublicId);

  const manager = await Manager.findByIdAndUpdate(
    req.manager?._id,
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
        manager,
      },
      'Manager avatar updated successfully'
    )
  );
});

export {
  registerManager,
  loginManager,
  logoutManager,
  refreshAccessToken,
  createMember,
  createGym,
  createTrainer,
  createMembershipPlan,
  createNotice,
  changePasswordManager,
  getCurrentManager,
  updateManager,
  updateAvatarManager,
};
