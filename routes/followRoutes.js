const express = require("express");
const router = express.Router();
const FollowController = require("../controller/followController");
const check = require("../middlewares/auth");

router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.meFollowing);
router.get("/followers/:id?/:page?", check.auth, FollowController.followingMe);

module.exports = router;