const mongoose = require("mongoose");

const connection = async() => {
    try {

        await mongoose.connect("mongodb://mongo:mcoX6awOZuQ5r5G1cMwS@containers-us-west-151.railway.app:6987/");
        console.log("Connected to the api_rest_social_media database");

    } catch(error) {

        console.log(error);
        throw new Error("Could not connect to the database");

    }
}

module.exports = {
    connection
}