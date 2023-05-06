const express = require("express");
const router = express.Router();
const PublicationController = require("../controller/publicationController");

router.get("/publication-test", PublicationController.publicationTest);

module.exports = router;