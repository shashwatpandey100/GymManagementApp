import { Router } from 'express';
import {
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
} from '../controllers/admin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/authAdmin.middleware.js';

const router = Router();

router.route('/login').post(loginAdmin);

// secured routes
router.route('/logout').post(verifyJWT, logoutAdmin);
router.route('/refresh-token').post(refreshAccessTokenAdmin);
router.route('/change-password').post(verifyJWT, changePasswordAdmin);
router.route('/me').get(verifyJWT, getCurrentAdmin);
router.route('/update').put(verifyJWT, updateAdmin);
router
  .route('/update-avatar')
  .put(upload.single('avatar'), verifyJWT, updateAvatarAdmin);
router.route('/gyms').get(verifyJWT, getAllGyms);
router.route('/gyms/search').get(verifyJWT, searchGyms);
router.route('/gyms/delete').delete(verifyJWT, deleteGym);
router.route('/managers').get(verifyJWT, getAllManagers);
router.route('/managers/search').get(verifyJWT, searchManagers);
router.route('/managers/delete').delete(verifyJWT, deleteManager);

export default router;
