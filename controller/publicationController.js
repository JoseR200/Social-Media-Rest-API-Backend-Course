
const publicationTest = (req, res) => {
    return res.status(200).json({
        "message": "Message sent from controller/publication.js"
    });
}

module.exports = {
    publicationTest
}