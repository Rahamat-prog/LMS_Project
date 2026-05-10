const express = require('express');
const {register, login , logout, getProfile} = require('../controllers/controllers');
const isLoging = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware')
// instance 
const router = express.Router();

// API define for different method
router.post('/register', upload.single("avatar"), register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/getProfile',isLoging, getProfile);



module.exports = router;