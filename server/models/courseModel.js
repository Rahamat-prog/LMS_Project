const {model, Schema, default: mongoose} = require('mongoose');
const { title } = require('node:process');

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [8, "Title must be at least 8 characters"],
        maxLength: [59, 'Title should be less than 60 characters'],
        trim: true
    },
    description: {
        type: String
        required: [true, 'description is required'],
        minLength: [8, "description must be at least 8 characters"],
        maxLength: [200, 'description should be less than 60 characters'],
    },
    category: {
        type: String
        required: [true, 'category is required'],
    },
    thumbnil: {
         public_id: {
                    type: String,
                    required: true
                }
            },
            secure_url: {
                type: String,
                required: true
            }
   
    lacture: [
        {
            title: String,
            description: String,
            lacture: {
                public_id: {
                    type: String
                }
            },
            secure_url: {
                type: String
            }
        }
    ],
    numberOfLactures: {
        type: Number,
        default: 0
    },
    createBy: {
        type: String
        required: [true, 'createBy is required'],
    }
}, {
    timestamps: true
})

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;