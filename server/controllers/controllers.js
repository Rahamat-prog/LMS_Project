const AppError = require("../utils/errorUtils");
const User = require('../models/userModel');
const cloudinary = require('cloudinary');
const fs = require('fs/promises');
const sentEmail = require('../utils/sentEmail');
// cookie option 
const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        // instance of error and next so a app mai jaye ga and dekega ki userRouter ke niche error midleware h to usmai next kar dega 
        return next(new AppError('All field is required', 400))
    }

    // check user is already register or not byh the provided email id 
    const userExits = await User.findOne({ email });

    if (userExits) {
        return next(new AppError('user is already exists', 400));

    }

    //Create new user with the given necessary data and save to DB

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: '',
            secure_url: ''
        }
    })

    // if user is not create someting wrong 
    if (!user) {
        return next(new AppError('user registration faild please try agian', 400));
    }

    // TODO: file upload into db

    if (req.file) {   // req.file is provided by Multer
        // console.log("file is ", req.file)
        try {
            //  Cloudinary - Takes that file and stores it on cloud, gives back a URL and returns → { url: 'https://cloudinary.com/your-image.jpg' } inside the result,
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            })
            //
            if (result) {
                console.log("result", result);
                user.avatar = {
                    public_id: result.public_id,  // Cloudinary ID (used to delete later) ||  // ← Cloudinary generated ID
                    secure_url: result.secure_url // HTTPS image URL (saved in DB)
                }
                //After uploading to Cloudinary, file is no longer needed on your server,Deletes the temporary file Multer saved locally
                await fs.rm(`uploads/${req.file.filename}`)
            }

        } catch (error) {
            return next(new AppError(error || `file not uploaded , please try agian `, 500));
        }
    }

    await user.save();
    // console.log("user details", user)
    user.password = undefined;

    // token store inside the cookie 
    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOption)

    return res.status(201).json({
        success: true,
        message: "user is registered successfully",
        user
    })


}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return next(new AppError('All field is required', 400));
        }

        const user = await User.findOne({
            email
        }).select('+password');

        if (!user || !user.compairePassword(password)) {
            return next(new AppError('provided password or email is wrong', 400));
        }

        // store the token inside the cookie and make sure password is not pass as string so its must be undefined
        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOption);

        // sent the res if the user is login 
        return res.status(201).json({
            success: true,
            message: "usre is login successfully",
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 500))
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

        // save the token 
        await user.save();

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

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
        const { token, password } = req.body;

        if (!token || !password) {
            return next(new AppError('token and password are required', 400));
        }

        return res.status(501).json({
            success: false,
            message: 'reset password is not implemented yet'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

module.exports = { register, login, logout, getProfile, forgotPassword, resetPassword };