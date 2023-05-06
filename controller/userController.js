
const userTest = (req, res) => {
    return res.status(200).json({
        "message": "Message sent from controller/user.js"
    });
}

module.exports = {
    userTest
}