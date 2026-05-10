// dotenv cofig
const {config} = require('dotenv');
config();
const app = require('./app');
const connectionToDB = require('./config/dbConnection');
const cloudinary  = require('cloudinary');


const PORT =    process.env.PORT || 5000

// cloudinary configurtion 
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`sever is running at http://localhost:${PORT}`)
});


