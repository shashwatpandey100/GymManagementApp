import { Router } from 'express';
import {
  loginMember,
  logoutMember,
  refreshAccessTokenMember,
  changePasswordMember,
  getCurrentMember,
  updateMember,
  updateAvatarMember,
} from '../controllers/member.controller.js';
import { verifyJWT } from '../middlewares/authMember.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/login').post(loginMember);

// secured routes
router.route('/logout').post(verifyJWT, logoutMember);
router.route('/refresh-token').post(refreshAccessTokenMember);
router.route('/change-password').post(verifyJWT, changePasswordMember);
router.route('/me').get(verifyJWT, getCurrentMember);
router.route('/update').put(verifyJWT, updateMember);
router
  .route('/update-avatar')
  .put(upload.single('avatar'), verifyJWT, updateAvatarMember);

export default router;
