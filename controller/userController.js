const User = require("../models/UserModel")
const bcrypt = require("bcrypt");

const jwt = require("../services/jwt");

const userTest = (req, res) => {
    return res.status(200).json({
        "message": "Message sent from controller/user.js",
        "user": req.user
    });
}

const register = (req, res) => {
    let params = req.body;

    if(!params.name || !params.email || !params.password || !params.nick){
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    } 

    User.find({ $or: [

        {email: params.email.toLowerCase()},
        {nick: params.nick.toLowerCase()}

    ]}).then( async(users) => {

        if (users && users.length >= 1){
            return res.status(200).json({
                "status": "success",
                "message": "The user already exists"
            });
        }

        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        let user_to_save = new User(params);

        user_to_save.save().then(userStored => {
            if(!userStored){

                return res.status(500).json({
                    "status": "error",
                    "message": "Error while saving user"
                });

            }
            return res.status(200).json({
                "status": "success",
                "message": "User registered",
                "user": userStored
            });

        }).catch( error => {

            return res.status(500).json({
                "status": "error",
                "message": "Error while saving user"
            });

        });
    }).catch( error => {

        return res.status(500).json({
            "status": "error",
            "message": "Missing data"
        });

    });
}

const login = (req, res) => {
    const params = req.body;

    if(!params.email || !params.password){
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    }

    User.findOne({email: params.email}).then( user =>{
        if(!user){
            return res.status(400).json({
                "status": "error",
                "message": "User doesn't exist"
            });
        }

        let pwd = bcrypt.compareSync(params.password, user.password);

        if(!pwd){
            return res.status(400).json({
                "status": "error",
                "message": "Passwords doesn't match"
            });
        }

        const token = jwt.createToken(user);

        return res.status(200).json({
            "status": "success",
            "message": "You have identified correctly",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    }).catch( error => {
        return res.status(400).json({
            "status": "error",
            "message": "User doesn't exist"
        });
    });
}

module.exports = {
    userTest,
    register,
    login
}