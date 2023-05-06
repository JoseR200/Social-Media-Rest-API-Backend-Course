const mongoose = require("mongoose");

const connection = async() => {
    try {

        await mongoose.connect("mongodb://127.0.0.1:27017/api_rest_social_media_backend_course");
        console.log("Connected to the api_rest_social_media database");

    } catch(error) {

        console.log(error);
        throw new Error("Could not connect to the database");

    }
}

module.exports = {
    connection
}