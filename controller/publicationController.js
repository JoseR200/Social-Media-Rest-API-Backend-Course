const Publication = require("../models/PublicationModel");
const fs = require("fs");
const path = require("path");

const followService = require("../services/followUserIds");

const save = (req, res) => {
    const params = req.body;

    if (!params.text) {
        return res.status(400).json({
            "status": "error",
            "message": "Publication text missing"
        });
    }
    params.user=req.user.id;

    let newPublication = new Publication(params);
    

    newPublication.save().then( publicationStored => {
        if (!publicationStored) {
            return res.status(400).json({
                "status": "error",
                "message": "Couldn't save publication"
            });
        }

        return res.status(200).json({
            "status": "success",
            "message": "Publication saved",
            publicationStored
        });

    }).catch(() => {
        return res.status(400).json({
            "status": "error",
            "message": "Error while saving publication"
        });
    });
}

const detail = (req, res) => {
    const publicationId = req.params.id;

    Publication.findById(publicationId).then( publicationStored => {
        if (!publicationStored) {
            return res.status(400).json({
                "status": "error",
                "message": "Publication doesn't exist"
            });
        }

        return res.status(200).json({
            "status": "success",
            publicationStored
        });

    }).catch( () => {
        return res.status(400).json({
            "status": "error",
            "message": "Error while get publication"
        });
    });
}

const remove = (req, res) => {
    const publicationId = req.params.id;

    Publication.findOneAndDelete({"user": req.user.id, "_id": publicationId}).then( publicationDeleted => {
        if (!publicationDeleted) {
            return res.status(500).json({
                "status": "error",
                "message": "No publication found"
            });
        }

        return res.status(200).json({
            "status": "success",
            "message": "Publication removed",
            "publication": publicationId
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            "message": "You couldn't delete"
        });
    });
}

const userPublications = (req, res) => {
    const userId = req.params.id;

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemsPerPage = 5;

    Publication.find({"user": userId}).sort("-created_at").populate('user', '-password -__v -role -email')
    .paginate(page, itemsPerPage).then( async(publications) => {

        if (!publications || publications.length <= 0) {
            return res.status(404).json({
                "status": "error",
                "message": "No publications found"
            });
        }

        const total = await Publication.countDocuments({ user: userId }).exec();

        return res.status(200).json({
            "status": "success",
            "message": "Publications from user profile",
            "publication": publications,
            page,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    }).catch( () => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while finding publications"
        });
    });
}

const uploadImage = (req, res) => {
    const publicationId = req.params.id;

    if(!req.file){
        return res.status(400).json({
            "status": "error",
            "message": "Missing image"
        });
    }

    let image = req.file.originalname;

    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(400).json({
            "status": "error",
            "message": "Invalid file extension"
        });
    }

    Publication.findOneAndUpdate({ "user": req.user.id, "_id": publicationId}, {file: req.file.filename}, {new: true}).then( publicationUpdated => {
        if(!publicationUpdated){
            return res.status(500).json({
                "status": "error",
                "message": "Error while uploading image"
            });
        }
        
        return res.status(200).json({
            "status": "success",
            publiblication: publicationUpdated,
            file: req.file
        });
    }).catch(error => {
        return res.status(500).json({
            "status": "error",
            "message": "Error while uploading image"
        });
    });
}

const avatar = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/publications/"+file;

    fs.stat(filePath, (error, exists) => {
        if(!exists) {
            return res.status(404).json({
                "status": "error",
                "message": "Image doesn't exist"
            });
        }
        
        return res.sendFile(path.resolve(filePath));
    });
}

const feed = async(req, res) => {
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 5;
    try {
        const myFollows = await followService.followUserIds(req.user.id);

        const publications = await Publication.find({
            user: myFollows.following
        }).sort("-created_at").populate("user", "name nick").paginate(page, itemsPerPage);

        const total = publications.length;

        return res.status(200).json({
            "status": "succes",
            "message": "Feed",
            following: myFollows.following,
            publications,
            page,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    } catch (error) {
        return res.status(500).json({
            "status": "error",
            "message": "Couldn't get publications"
        });
    }
}

module.exports = {
    save,
    detail,
    remove,
    userPublications,
    uploadImage,
    avatar,
    feed
}