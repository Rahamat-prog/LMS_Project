// dotenv cofig
const {config} = require('dotenv');
config();
const app = require('./app');
const connectionToDB = require('./config/dbConnection');
require("./config/cloudinary");


const PORT =    process.env.PORT || 5000

app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`sever is running at http://localhost:${PORT}`)
});


