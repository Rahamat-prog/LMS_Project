const express = require('express');
const {register, login , logout, getProfile, forgotPassword, resetPassword} = require('../controllers/controllers');
const isLoging = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware')

// instance 
const router = express.Router();

// API define for different method
router.post('/register', upload.single("avatar"), register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/getProfile',isLoging, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);



module.exports = router;