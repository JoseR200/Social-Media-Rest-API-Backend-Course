const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const check = require("../middlewares/auth");

router.get("/user-test", check.auth, UserController.userTest);

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile", check.auth, UserController.profile);
router.get("/profileList/:page?", check.auth, UserController.list);
router.put("/update", check.auth, UserController.updateProfile);
router.post("/upload", check.auth, UserController.uploadImage);

module.exports = router;