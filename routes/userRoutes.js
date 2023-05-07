const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const check = require("../middlewares/auth");

router.get("/user-test", check.auth, UserController.userTest);

router.post("/register", UserController.register);
router.get("/login", UserController.login);

module.exports = router;