const jwt = require("jwt-simple");
const moment = require("moment");

const libjwt = require("../services/jwt");
const secret = libjwt.secret;

exports.auth = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(403).json({
            "status": "error",
            "message": "Request doesn't have auth header"
        });
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        let payLoad = jwt.decode(token, secret);

        if (payLoad.exp <= moment().unix()){
            return res.status(401).json({
                "status": "error",
                "message": "Token expired"
            });
        }

        req.user = payLoad;
    } catch(error){
        return res.status(404).json({
            "status": "error",
            "message": "Invalid token"
        });
    }

    next();
}