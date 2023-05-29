const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controller/userController");
const check = require("../middlewares/auth");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({storage});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/myProfile", check.auth, UserController.myProfile);
router.get("/profile/:id?", check.auth, UserController.profile);
router.get("/profileList/:page?", check.auth, UserController.list);
router.put("/update", check.auth, UserController.updateProfile);
router.post("/upload", [check.auth, uploads.single("file0")], UserController.uploadImage);
router.get("/avatar/:file", UserController.avatar);
router.get("/counter/:id?", check.auth, UserController.counter);

module.exports = router;