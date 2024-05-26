import { Router } from 'express';
import {
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
} from '../controllers/manager.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/authManager.middleware.js';

const router = Router();

router.route('/register').post(
  upload.single('avatar'),
  registerManager
);

router.route('/login').post(loginManager);

// secured routes
router.route('/logout').post(verifyJWT, logoutManager);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/create-member').post(verifyJWT, createMember);
router.route('/create-gym').post(verifyJWT, createGym);
router.route('/create-trainer').post(verifyJWT, createTrainer);
router.route('/create-membership-plan').post(verifyJWT, createMembershipPlan);
router.route('/create-notice').post(verifyJWT, createNotice);
router.route('/change-password').post(verifyJWT, changePasswordManager);
router.route('/me').get(verifyJWT, getCurrentManager);
router.route('/update').put(verifyJWT, updateManager);
router
  .route('/update-avatar')
  .put(upload.single('avatar'), verifyJWT, updateAvatarManager);

export default router;
