const multer = require("multer");

function getProfilePicUpload() {
    let storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/profile_pic");
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 1000000
        }
    }).single("profile_pic");
}

module.exports = {
    getProfilePicUpload
}