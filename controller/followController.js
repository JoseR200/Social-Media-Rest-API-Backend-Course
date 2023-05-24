const Follow = require("../models/FollowModel");
const User = require("../models/UserModel");
const mongoosePaginate = require("mongoose-pagination");

const followService = require("../services/followUserIds");

const followTest = (req, res) => {
    return res.status(200).json({
        "message": "Message sent from controller/follow.js"
    });
}

const save = (req, res) => {
    const params = req.body;

    const identity = req.user;

    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    userToFollow.save().then(followStored => {
        if (!followStored) {
            return res.status(500).json({
                "status": "error",
                "message": "Could not follow user"
            });
        }

        return res.status(200).json({
            "status": "success",
            "identity": req.user,
            follow: followStored
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            "message": "Could not follow user"
        });
    });
}

const unfollow = (req, res) => {
    const userId = req.user.id;

    const followedId = req.params.id;

    Follow.findOneAndDelete({ "user": userId, "followed": followedId })
        .then(followDeleted => {
            if (!followDeleted) {
                return res.status(500).json({
                    "status": "error",
                    "message": "You couldn't unfollow"
                });
            }
            return res.status(200).json({
                "status": "success",
                "message": "Follow deleted successfully"
            });
        }).catch(error => {
            return res.status(500).json({
                "status": "error",
                "message": "You couldn't unfollow"
            });
        });
}

const meFollowing = (req, res) => {
    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    }

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemsPerPage = 5;

    Follow.find({ user: userId }).populate("user followed", "-password -role -__v")
    .paginate(page, itemsPerPage).then( async(follows) => {
        
        const total = await Follow.countDocuments({ user: userId }).exec();

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            "status": "success",
            "message": "List of users that I'm following",
            follows,
            total,
            pages: Math.ceil(total/itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    }).catch( error => {

    });
}

const followingMe = (req, res) => {
    return res.status(200).json({
        "status": "success",
        "message": "List of users than are following me"
    });
}

module.exports = {
    followTest,
    save,
    unfollow,
    meFollowing,
    followingMe
}