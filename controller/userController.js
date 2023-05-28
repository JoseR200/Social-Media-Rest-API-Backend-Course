const User = require("../models/UserModel")
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs")
const path = require("path")

const jwt = require("../services/jwt");
const followService = require("../services/followUserIds");

const register = (req, res) => {
    let params = req.body;

    if(!params.name || !params.email || !params.password || !params.nick){
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    } 

    User.find({ $or: [
        {email: params.email.toLowerCase()}
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

const myProfile = (req, res) => {
    User.findById(req.user.id).select({password: 0, role: 0}).then(user => {
        if(!user){
            return res.status(404).json({
                "status": "error",
                "message": "User doesn't exist"
            });
        }


        return res.status(200).json({
            "status": "success",
            "user": user
        });

    }).catch( () => {
        return res.status(404).json({
            "status": "error",
            "message": "User doesn't exist"
        });
    });
}

const profile = (req, res) => {
    const id = req.params.id;

    User.findById(id).select({password: 0, role: 0}).then(async(user) => {
        if(!user){
            return res.status(404).json({
                "status": "error",
                "message": "User doesn't exist"
            });
        }

        const followInfo = await followService.followThisUser(req.user.id, id)

        return res.status(200).json({
            "status": "success",
            "user": user,
            following: followInfo.following,
            follower: followInfo.follower
        });
    }).catch( () => {
        return res.status(404).json({
            "status": "error",
            "message": "User doesn't exist"
        });
    });
}

const list = (req, res) => {
    let page = 1;

    if(req.params.page){
        page = parseInt(req.params.page);
    }

    let itemsPerPaginate = 5;

    User.find({ _id: { $ne: req.user.id } }).sort('_id').paginate(page, itemsPerPaginate).then(async(users) => {
        if(!users) {
            return res.status(404).json({
                status: "Error",
                message: "No users avaliable..."
            });
        }

        const total = await User.countDocuments({}).exec();

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            "status": "success",
            "profile": req.user,
            users,
            itemsPerPaginate,
            total,
            pages: Math.ceil(total/itemsPerPaginate),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    }).catch((error) => {
        return res.status(500).json({
            "status": "error",
            error
        });
    });
}

const updateProfile = (req, res) => {
    let userIdentity = req.user;
    let userToUpdate = req.body

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    User.find({ $or: [

        {email: userIdentity.email.toLowerCase()}

    ]}).then( async(users) => {
        let userIsset = false;

        users.forEach(user => {
            if(user && user._id != userIdentity.id){
                userIsset = true;
            }
        });

        if (userIsset){
            return res.status(200).json({
                "status": "success",
                "message": "The user already exists"
            });
        }

        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }
        
        try {
            let userUpdated= await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new: true});

            if(!userUpdated){
                return res.status(400).json({
                    "status": "error",
                    "message": "Error while updating user"
                });
            }

            return res.status(200).json({
                "status": "success",
                user: userUpdated
            });    

        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Error while updating user",
            });
        } 
    }).catch( error => {

        return res.status(500).json({
            "status": "error",
            "message": "Error while saving user",
            error
        });

    });
}

const uploadImage = (req, res) => {
    if(!req.file){
        return res.status(400).json({
            "status": "error",
            "message": "Missing image"
        });
    }

    let image = req.file.originalname;

    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(400).json({
            "status": "error",
            "message": "Invalid file extension"
        });
    }

    User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true}).then( userUpdated => {
        if(!userUpdated){
            return res.status(500).json({
                "status": "error",
                "message": "Error while uploading avatar"
            });
        }
        
        return res.status(200).json({
            "status": "success",
            user: userUpdated,
            file: req.file
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            "message": "Error while uploading avatar"
        });
    });
}

const avatar = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/avatars/"+file;

    fs.stat(filePath, (error, exists) => {
        if(!exists) {
            return res.status(404).json({
                "status": "error",
                "message": "Image doesn't exist"
            });
        }
        
        return res.sendFile(path.resolve(filePath));
    });
}

module.exports = {
    register,
    login,
    myProfile,
    profile,
    list,
    updateProfile,
    uploadImage,
    avatar
}