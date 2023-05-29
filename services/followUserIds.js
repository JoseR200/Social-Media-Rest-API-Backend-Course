const Follow = require("../models/FollowModel")

const followUserIds = async(identityUserId) => {
    try {
        let following = await Follow.find({"user": identityUserId})
        .select({"userFollowed": 1, "_id": 0}).then( follows => {
            return follows
        });

        let followers = await Follow.find({"userFollowed": identityUserId})
        .select({"user": 1, "_id": 0}).then( follows => {
            return follows
        });

        let followingClean = [];

        following.forEach( follow => {
            followingClean.push(follow.userFollowed);
        });

        let followersClean = [];

        followers.forEach( follow => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean 
        }
    } catch (error) {
        return {}; 
    }
    
}

const followThisUser = async(identityUserId, profileUserId) => {
    let following = await Follow.findOne({"user": identityUserId, "userFollowed": profileUserId}).then( follows => {
        return follows
    });

    let follower = await Follow.findOne({"user": profileUserId, "userFollowed": identityUserId}).then( follows => {
        return follows
    });

    return {
        following,
        follower
    }
}

module.exports = {
    followUserIds,
    followThisUser
}