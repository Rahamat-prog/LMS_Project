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
    console.log("userExits", userExits);
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
        // remove the token form the cookie 
        res.cookie('token', null, {secure: true, maxAge: 0, httpOnly: true });

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
        const userId = req.user._id;
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
        // STEP 1: Extract email from request body
        const { email } = req.body;

        // STEP 2: Validate all fields are provided
        if (!email) {
            return next(new AppError('email is not provided', 400));
        }
        // STEP 3: Check if user already exists with same email ||  Query database: "Find user with this email"
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('user not found with this email', 404));
        }

        // STEP 4: Generate password reset token
        const resetToken = await user.generatePasswordResetToken();
        // console.log("resetToken", resetToken);

         // STEP 5: Save token and expiry to database
        await user.save();

        // STEP 6: Create reset password URL
        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // console.log("reset password link", resetPasswordUrl);

        // STEP 7: Prepare email content
        const subject = 'Reset Password';
        const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
        console.log("email link", message);
        // STEP 8: Send email with reset link
        try {
            await sentEmail(email, subject, message);
            // Email sent successfully
            return res.status(200).json({
                success: true,
                message: `Password reset link has been sent to your email ${email}`
            })
        }catch(error) {
            // STEP 9: If email fails, clean up tokens || Remove tokens from database since email wasn't sent
            user.forgotPasswordToken = undefined;
            user.forgotPasswordExpiry = undefined;
            await user.save();
            return next(new AppError(error.message, 500));
        }
}catch(error) {
     return next(new AppError(error.message, 500));
}
}


const resetPassword = async (req, res, next) => {
    try {
        // STEP 1: Extract reset token from URL
        const { resetToken } = req.params; 

        // STEP 2: Extract new password from request body
        const { password } = req.body;

        // STEP 3: Validate password is provided
        if (!req.body || !password) {
            return next(new AppError('token and password are required. Ensure you send JSON body with a password field.', 400));
        }

        // STEP 4: Hash the plain text token from URL // Remember: Token in database is hashed// Token in URL is plain text // We need to hash the URL token to compare with database
        const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');  // forgotPasswordToken = "$2b$10$hashed..." (same as in database)
        
        // STEP 5: Find user with matching hashed token AND token not expired
        const user = await User.findOne({
            forgotPasswordToken, //Token matches
            forgotPasswordExpiry: { $gt: Date.now() } // Expiry not passed
        });
         // STEP 6: Check if user found
        if (!user) {
            return next(new AppError('Token is expired or invalid, please try again', 400));
        }
        // STEP 7: Update user's password
        user.password = password; // Password will be auto-hashed by pre-save hook

        // STEP 8: Clear token fields (one-time use)
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        // STEP 9: Save to database
        await user.save(); 

        // STEP 10: Send success response
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}


const changePassword = async (req, res,) => {

    // STEP 1: Extract old and new passwords from request body
    const {oldPassword, newPassword} = req.body

    // STEP 2: Extract user ID from authenticated request || id comes from JWT token (set by isLoging middleware)
    const id = req.user._id;

       // STEP 3: Validate both passwords are provided
    if (!oldPassword || !newPassword) {
        return next(new AppError(error.message, 400));
    }
    // STEP 4: Find user in database with password field included
    const user = await User.findById(id).select('+password')

     // STEP 5: Check if user exists
    if(!user) {
        return next(new AppError(error.message, 400));
    }

    // STEP 6: Verify old password is correct
    const isPasswordValid = await user.compairePassword(oldPassword)  // bcrypt.compare does: // bcrypt.compare("myPass123", "$2b$10$N9qo8uLO...")
    // STEP 7: Check if old password matches
    if (!isPasswordValid) {
        return next(new AppError(error.message, 500));
    }
    // STEP 8: Update password to new one
    user.password = newPassword;

    // STEP 9: Save to database ||  Pre-save hook automatically hashes the password
    await user.save();

     // STEP 10: Remove password from response (security)
    user.password = undefined;
    // STEP 11: Send success response
    res.status(200).json({
        success: true,
        message: "password changed successfully",
        user

    })
}

const updateUser = async (req, res, next) => {
    //Exact the fullname from the body 
    const {fullName} = req.body;
    // exact the id from the req.user || auth middleware share the req.user 
    const id = req.user._id;

    // valid the full name 
    if(!fullName) {
        return next (new AppError("Full name is required", 400));
    }

    // find the user in db 
    const userExits = await User.findById(id);

    // if user is not exit so throw the error 
    if(!userExits) {
        return next (new AppError('User not found', 404));
    }

    // update the name 
    if(fullName){
        userExits.fullName = fullName;
    }

    // now upload the new avatar 
     if (req.file) {  

        // remove the avatar as we want to upload new one
        await cloudinary.v2.uploader.destroy(userExits.avatar.public_id);

        try { // call the uploadOnCloudinary function with the file path and go to utilis/cloudinary
           const result = await uploadOnCloudinary(req.file.path);

            //// Validate upload result
            if (!result) {
                return next (new AppError("Image upload failed", 500));
            }

            // save image details in database
            userExits.avatar = {
                    public_id: result.public_id,  // Cloudinary ID (used to delete later) ||  // ← Cloudinary generated ID
                    secure_url: result.secure_url // HTTPS image URL (saved in DB)
            }

        } catch (error) {
            // If upload fails, send error
            return next(new AppError(error || `file not uploaded , please try agian `, 500));
        }
    }

    // save the user 
    await userExits.save();
    
    return res.status(200).json({
        success: true,
        message : "user is updated successfully"
    })



}

module.exports = { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser }; 