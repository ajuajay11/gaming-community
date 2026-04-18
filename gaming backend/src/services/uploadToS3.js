const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const sharp = require("sharp");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi"];

// Image resize/compress: max 1920px, WebP quality 82
const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 82;

const compressImage = async (buffer) => {
    return sharp(buffer)
        .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();
};

const uploadToS3 = async (file) => {
    const { buffer, mimetype, originalname } = file;

    const isPhoto = ALLOWED_PHOTO_TYPES.includes(mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimetype);

    if (!isPhoto && !isVideo) {
        throw new Error("Invalid file type. Only photos and videos allowed.");
    }

    const folder = isPhoto ? "gallery/photos" : "gallery/videos";
    let body = buffer;
    let contentType = mimetype;
    const ext = isPhoto ? ".webp" : path.extname(originalname);
    const fileName = `${folder}/${uuidv4()}${ext}`;

    if (isPhoto) {
        body = await compressImage(buffer);
        contentType = "image/webp";
    }
    // Videos: uploaded as-is (size limited by multer fileSize limit)

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: body,
        ContentType: contentType,
    };

    const result = await s3.upload(params).promise();

    return {
        url: result.Location,
        key: result.Key,
        type: isPhoto ? "photo" : "video",
    };
};

const deleteFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };
    await s3.deleteObject(params).promise();
};

/**
 * Derive S3 object key from the Location URL returned by `s3.upload` (same bucket).
 * Supports virtual-hosted and path-style URLs.
 */
function keyFromLocationUrl(url) {
    if (!url || typeof url !== "string") return null;
    try {
        const u = new URL(url);
        const bucket = process.env.AWS_BUCKET_NAME;
        if (!bucket) return null;
        const host = u.hostname.toLowerCase();
        const pathPart = decodeURIComponent(u.pathname.replace(/^\/+/, ""));

        if (host.startsWith(`${bucket.toLowerCase()}.s3`) || host === `${bucket}.s3.amazonaws.com`) {
            return pathPart || null;
        }

        const segments = u.pathname.split("/").filter(Boolean);
        if (segments[0] === bucket) {
            return segments.slice(1).join("/") || null;
        }

        if (host.includes("amazonaws.com") && pathPart) {
            return pathPart;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function collectImageKeys(images) {
    if (!images?.length) return [];
    return images
        .map((img) => {
            if (typeof img === "string") return keyFromLocationUrl(img);
            if (img && typeof img === "object" && img.key) return img.key;
            if (img && typeof img === "object" && img.url) return keyFromLocationUrl(img.url);
            return null;
        })
        .filter(Boolean);
}

/** Delete many objects; failures are logged and do not throw (listing delete still proceeds). */
async function deleteManyFromS3(keys) {
    const unique = [...new Set(keys.filter(Boolean))];
    await Promise.all(
        unique.map((key) =>
            deleteFromS3(key).catch((err) => {
                console.error(`S3 deleteObject failed for "${key}":`, err.message);
            })
        )
    );
}

module.exports = {
    uploadToS3,
    deleteFromS3,
    keyFromLocationUrl,
    collectImageKeys,
    deleteManyFromS3,
};