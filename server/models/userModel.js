const { model, Schema } = require('mongoose');
const { timeStamp } = require('node:console');
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken');
const crypto = require('crypto');


const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'name is required'],
        minLength: [5, "name at least 5 charactor"],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
        ]
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minLength: [8, "password at least 8 charactor"],
        select: false, // will not select password upon loking up a document
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER' // ← Default valu || When you create a user without specifying a role, MongoDB automatically assigns 'USER'. You don't need to pass it from req.body unless you want to override the default.
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
},
    {
        timestamps: true, // ← This auto-generates createdAt & updatedAt
    },

);

// increpted the password before save into db
userSchema.pre('save', function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = bcrypt.hash(this.password, 10)
})

// generate jwt token 
userSchema.methods = {
    generateJWTToken: function() {
        return  JWT.sign(
            {_id: this._id, email: this.email, subscription: this.subscription},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRY}
        )
    },
    // compire the plantext password with the stored password 
    compairePassword: async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    generatePasswordResetToken: async function() {
         // creating a random token using node's built-in crypto module
        const resetToken = crypto.randomBytes(20).toString('hex');
         // Again using crypto module to hash the generated resetToken with sha256 algorithm and storing it in database
        this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        // Adding forgot password expiry to 15 minutes
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min form now 
        return resetToken;
    },
}


const User = model('User', userSchema);

module.exports = User;