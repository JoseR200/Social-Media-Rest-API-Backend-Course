const express = require("express");
const router = express.Router();
const multer = require("multer");
const PublicationController = require("../controller/publicationController");
const check = require("../middlewares/auth");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, "publication-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({storage});

router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id/:page?", check.auth, PublicationController.userPublications);
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.uploadImage);
router.get("/avatar/:file", PublicationController.avatar);
router.get("/feed/:page?", check.auth, PublicationController.feed);

module.exports = router;