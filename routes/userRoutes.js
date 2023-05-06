const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");

router.get("/user-test", UserController.userTest);

module.exports = router;