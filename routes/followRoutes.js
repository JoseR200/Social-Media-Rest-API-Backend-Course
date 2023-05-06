const express = require("express");
const router = express.Router();
const FollowController = require("../controller/followController");

router.get("/follow-test", FollowController.followTest);

module.exports = router;