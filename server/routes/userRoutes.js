const express = require('express');
const {register, login , logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser} = require('../controllers/controllers');
const isLoging = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware')

// instance 
const router = express.Router();

// All user-related endpoints are prefixed with /api/v1/user
router.post('/register', upload.single("avatar"), register);  // upload create req.file 
router.post('/login',login);
router.post('/logout',logout);
router.post('/getProfile',isLoging, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password:resetToken', resetPassword);
router.post('/change-password', isLoging, changePassword);
router.put('/update-user', isLoging, upload.single("avatar"), updateUser);


module.exports = router;
