
const followTest = (req, res) => {
    return res.status(200).json({
        "message": "Message sent from controller/follow.js"
    });
}

module.exports = {
    followTest
}