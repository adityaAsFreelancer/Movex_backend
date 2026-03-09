import express from 'express';
import { 
  loginOrSignup, 
  getMe, 
  getAllUsers, 
  verifyOtp, 
  sendOtp,
  registerUser, 
  driverApply, 
  approveDriver, 
  updateProfile, 
  updateSettings,
  toggleOnlineStatus, 
  savePushToken,
  partnerApply
} from '../controllers/authController';
import { updateLocation, updateLocationBatch } from '../controllers/driverController';
import { auth, roleGuard } from '../config/authMiddleware';
import { upload } from '../config/multer';

const router = express.Router();

router.post('/login', loginOrSignup);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', auth as any, roleGuard(['admin', 'customer']), registerUser);
router.post('/driver-apply', driverApply);
router.post('/partner-apply', partnerApply);
router.patch('/drivers/:driverId/approve', auth as any, roleGuard(['admin']), approveDriver);
router.get('/me', auth as any, getMe);
router.get('/users', auth as any, roleGuard(['admin']), getAllUsers);
router.put('/profile', auth as any, updateProfile);              // Update name/avatar
router.put('/settings', auth as any, updateSettings);            // Save settings to DB
router.post('/avatar', auth as any, upload.single('avatar'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  // We can finalize this in authController if we want to save to DB immediately
  res.status(200).json({ success: true, avatarUrl });
});
router.post('/toggle-online', auth as any, roleGuard(['driver']), toggleOnlineStatus);  // Online/Offline toggle
router.post('/location', auth as any, roleGuard(['driver']), updateLocation);           // Mobile telemetry fix
router.post('/location-batch', auth as any, roleGuard(['driver']), updateLocationBatch); // Offline sync batch
router.post('/push-token', auth as any, savePushToken);

export default router;
