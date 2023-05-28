const mongoose = require("mongoose");

const connection = async() => {
    try {

        await mongoose.connect("mongodb://mongo:3t0moHH35fWEvGfTu46h@containers-us-west-41.railway.app:6051/");
        console.log("Connected to the api_rest_social_media database");

    } catch(error) {

        console.log(error);
        throw new Error("Could not connect to the database");

    }
}

module.exports = {
    connection
}