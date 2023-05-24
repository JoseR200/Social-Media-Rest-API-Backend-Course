const Follow = require("../models/FollowModel")

const followUserIds = async(identityUserId) => {
    try {
        let following = await Follow.find({"user": identityUserId})
        .select({"followed": 1, "_id": 0}).then( follows => {
            return follows
        });

        let followers = await Follow.find({"followed": identityUserId})
        .select({"user": 1, "_id": 0}).then( follows => {
            return follows
        });

        let followingClean = [];

        following.forEach( follow => {
            followingClean.push(follow.followed);
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

}

module.exports = {
    followUserIds,
    followThisUser
}