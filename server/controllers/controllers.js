const AppError = require("../utils/errorUtils");
const User = require('../models/userModel');
const cloudinary = require('cloudinary');
const fs = require('fs/promises');
const sentEmail = require('../utils/sentEmail');
const crypto = require('crypto');
const uploadOnCloudinary = require('../utils/cloudinary');

// cookie option 
const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {

    // STEP 1: Extract data from request body
    const { fullName, email, password } = req.body;

    // STEP 2: Validate all fields are provided
    if (!fullName || !email || !password) {
        // instance of error and next so a app mai jaye ga and dekega ki userRouter ke niche error midleware h to usmai next kar dega 
        return next(new AppError('All field is required', 400))
    }

    // STEP 3: Check if user already exists with same email ||  Query database: "Find user with this email"
    const userExits = await User.findOne({ email });
    if (userExits) {
        return next(new AppError('user is already exists', 400)); // Prevent duplicate registration

    }
    // STEP 4: Create new user in database
    const user = await User.create({
        fullName,
        email,
        password, // Gets hashed automatically by pre-save hook
        avatar: {
            public_id: '',
            secure_url: ''
        }
    })
    // STEP 5: Check if user created successfully
    if (!user) {
        return next(new AppError('user registration faild please try agian', 400));
    }

    // STEP 6: Handle file upload (optional - if user uploads avatar) || req.file is provided by Multer || Contains: { filename, path, size, mimetype, etc }
    if (req.file) {  

        try { // call the uploadOnCloudinary function with the file path and go to utilis/cloudinary
           const result = await uploadOnCloudinary(req.file.path);

            //// Validate upload result
            if (!result) {
                return next (new AppError("Image upload failed", 500));
            }

            // save image details in database
            user.avatar = {
                    public_id: result.public_id,  // Cloudinary ID (used to delete later) ||  // ← Cloudinary generated ID
                    secure_url: result.secure_url // HTTPS image URL (saved in DB)
                }

        } catch (error) {
            // If upload fails, send error
            return next(new AppError(error || `file not uploaded , please try agian `, 500));
        }
    }
    // STEP 7: Save user to database (with avatar data if uploaded)
    await user.save();
    // console.log("user details", user)

    // STEP 8: Remove password from response (security)
    user.password = undefined;

    // STEP 9: Generate JWT token 
    const token = await user.generateJWTToken();

    // STEP 10: Store token in cookie
    res.cookie('token', token, cookieOption)

    // STEP 11: Send success response
    return res.status(201).json({
        success: true,
        message: "user is registered successfully",
        user
    })


}


const login = async (req, res, next) => {
    // STEP 1: Extract email and password from request body
    const { email, password } = req.body;

    try {
         // STEP 2: Validate input - check if both fields are provided
        if (!email || !password) {
            return next(new AppError('All field is required', 400));
        }
        // STEP 3: Find user in database with password field included // .select('+password') because password is hidden by default
        // Database query: || "Find me ONE user where ex email = 'ali@gmail.com'"and password='rahamat@12323'
        const user = await User.findOne({email}).select('+password');

        // STEP 4: Check if user exists AND password is correct // await user.compairePassword(password) compares entered password with hashed password
        if (!user || !(await user.compairePassword(password))) {
            return next(new AppError('Invaild password or email', 401));
        }
        // store the token inside the cookie and make sure password is not pass as string so its must be undefined
        const token = await user.generateJWTToken();

        // password is not pass as string so its must be undefined
        user.password = undefined;
        res.cookie('token', token, cookieOption);

        // sent the res if the user is login 
        return res.status(200).json({
            success: true,  
            message: "usre is logged successfully",
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 401))
    }

};

const logout = (req, res, next) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: "user is logout successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        return res.status(200).json({
            success: true,
            message: "user details",
            user
        });
    } catch (error) {
        return next(new AppError('failed to fetch the user profile', 400));
    }
}

// forgotPassword logic
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new AppError('email is not provided', 400));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('user not found with this email', 404));
        }

        // token generate 
        const resetToken = await user.generatePasswordResetToken();
        // console.log("resetToken", resetToken);

        // save the token 
        await user.save();

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log("reset password link", resetPasswordUrl);


        const subject = 'Reset Password';
        const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
        try {
            await sentEmail(email, subject, message);
            return res.status(200).json({
                success: true,
                message: `Password reset link has been sent to your email ${email}`
            })
        }catch(error) {
            // if any error occor during sent an email 
            user.forgotPasswordToken = undefined;
            user.forgotPasswordExpiry = undefined;
            return next(new AppError(error.message, 500));
        }
}catch(error) {
     return next(new AppError(error.message, 500));
}
}


const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params;
        const password = req.body?.password;

        if (!req.body || !password) {
            return next(new AppError('token and password are required. Ensure you send JSON body with a password field.', 400));
        }

        const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Token is expired or invalid, please try again', 400));
        }

        user.password = password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const changePassword = (req, res,) => {
    const {oldPassword, newPassword} = req.body
    const {id} =  req.user;

    if (!oldPassword || !newPassword) {
        return next(new AppError(error.message, 500));
    }
    //find password
    const user = await User.findById(id).select('+password')

    if(!user) {
        return next(new AppError(error.message, 500));
    }

    // if user is exit 
    const isPasswordValid = await user.compairePassword(oldPassword)  // bcrypt.compare does: // bcrypt.compare("myPass123", "$2b$10$N9qo8uLO...")

    if (!isPasswordValid) {
        return next(new AppError(error.message, 500));
    }

    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "password changed successfully",
        user

    })
}

module.exports = { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword }; 