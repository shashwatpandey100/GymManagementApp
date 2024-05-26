import { Router } from 'express';
import {
  loginTrainer,
  logoutTrainer,
  refreshAccessTokenTrainer,
  changePasswordTrainer,
  getCurrentTrainer,
  updateTrainer,
  updateAvatarTrainer,
} from '../controllers/trainer.controller.js';
import { verifyJWT } from '../middlewares/authTrainer.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/login').post(loginTrainer);

// secured routes
router.route('/logout').post(verifyJWT, logoutTrainer);
router.route('/refresh-token').post(refreshAccessTokenTrainer);
router.route('/change-password').post(verifyJWT, changePasswordTrainer);
router.route('/me').get(verifyJWT, getCurrentTrainer);
router.route('/update').put(verifyJWT, updateTrainer);
router
  .route('/update-avatar')
  .put(upload.single('avatar'), verifyJWT, updateAvatarTrainer);

export default router;
