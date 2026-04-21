const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (videos)
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/webp",
            "video/mp4", "video/mov", "video/avi"
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    }
});

const gameMediaUpload = upload.array("media", 20);
gameMediaUpload.kycProfile = upload.single("profilePicture");
gameMediaUpload.singleAvatar = upload.single("avatar");

const avatarOnly = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Avatar must be JPEG, PNG, or WebP"), false);
  },
});
gameMediaUpload.profileAvatar = avatarOnly.single("avatar");

module.exports = gameMediaUpload;
