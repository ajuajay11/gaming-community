const { BlobServiceClient, ContainerClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const sharp = require("sharp");

/**
 * Azure Blob Storage uploader (replaces the old S3 + local-disk service).
 *
 * Env contract (first match wins):
 *   1) AZURE_STORAGE_CONNECTION_STRING — recommended for dev / full control.
 *      DefaultEndpointsProtocol=https;AccountName=…;AccountKey=…;EndpointSuffix=core.windows.net
 *      Avoids SAS "resource type" mismatches entirely.
 *
 *   2) BLOB_URL — one of:
 *       (A) Account SAS — https://<account>.blob.core.windows.net/?sv=…&sig=…
 *           In Azure Portal: allowed resource types must include **Service, Container, Object**
 *           (srt=sco). Permissions need at least blob **Create, Write, Delete, Read**.
 *       (B) Container SAS — https://<account>.blob.core.windows.net/<container>?sv=…
 *           Allowed permissions: **Create, Write, Delete, Read** on the container.
 *       If you pasted a URL that includes extra path after the container (e.g. a blob
 *       path), we normalize to the container URL so the SDK gets a ContainerClient.
 *
 *   - AZURE_STORAGE_CONTAINER_NAME or AZURE_CONTAINER_NAME
 *            Blob container for uploads (connection string + account SAS). Defaults to "images".
 *
 * Objects in the DB continue to use the same `{ url, key }` shape the rest of
 * the codebase already expects:
 *   - `url`  Clean public URL to the blob (no SAS). Serve-ready when the
 *            container is public-read; otherwise you can append a read SAS at
 *            delivery time.
 *   - `key`  Blob name within the container, e.g. `gallery/photos/<uuid>.webp`.
 *            This is what `deleteBlob` takes and what we can re-derive from a
 *            stored URL via `keyFromLocationUrl`.
 */

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi"];

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 82;

function resolveContainerName() {
    const fromEnv =
        process.env.AZURE_STORAGE_CONTAINER_NAME?.trim() ||
        process.env.AZURE_CONTAINER_NAME?.trim();
    return fromEnv || "images";
}

const DEFAULT_CONTAINER_NAME = resolveContainerName();

/** Thrown before calling Azure when SAS cannot legally upload/delete blobs. */
class AzureSasConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "AzureSasConfigError";
    }
}

function usesConnectionStringAuth() {
    return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING?.trim());
}

/**
 * Validates BLOB_URL SAS. Connection-string auth skips this.
 * @see https://learn.microsoft.com/rest/api/storageservices/create-service-sas
 */
function assertBlobSasCanModifyBlobs() {
    if (usesConnectionStringAuth()) return;

    const raw = process.env.BLOB_URL?.trim();
    if (!raw) return;

    let u;
    try {
        u = new URL(raw);
    } catch {
        return;
    }

    const srt = (u.searchParams.get("srt") || "").toLowerCase();
    const sr = (u.searchParams.get("sr") || "").toLowerCase();
    const pathSegs = u.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

    if (sr === "b") {
        throw new AzureSasConfigError(
            "BLOB_URL uses a blob-only SAS (sr=b). Uploads need a new blob name each time — regenerate a " +
                "container SAS (sr=c) at https://<account>.blob.core.windows.net/<container>?<sas> " +
                "or an account SAS with Service+Container+Object (srt=sco).",
        );
    }

    const isAccountSasShape = pathSegs.length === 0;
    if (isAccountSasShape && srt) {
        if (!srt.includes("c") || !srt.includes("o")) {
            throw new AzureSasConfigError(
                "Your account SAS (BLOB_URL) must include resource types Container and Object, not Service alone. " +
                    "In Azure Portal: Storage account → Shared access signature → " +
                    "Allowed resource types: enable Container and Object (and usually Service). " +
                    "The query string should contain srt=sco (or at least both c and o), not srt=s. " +
                    "Or set AZURE_STORAGE_CONNECTION_STRING instead of BLOB_URL.",
            );
        }
    }
}

function accountHostFromConnectionString(cs) {
    const nameMatch = cs.match(/AccountName=([^;]+)/i);
    const suffixMatch = cs.match(/EndpointSuffix=([^;]+)/i);
    if (!nameMatch) return null;
    const name = nameMatch[1].trim();
    const suffix = (suffixMatch && suffixMatch[1].trim()) || "core.windows.net";
    return `${name}.blob.${suffix}`;
}

/** Log SAS shape (no secrets) to debug "resource type" auth errors. */
function logBlobConfigHint(label, blobUrl) {
    try {
        const u = new URL(blobUrl);
        const q = u.searchParams;
        const hint = {
            path: u.pathname || "/",
            sr: q.get("sr"),
            srt: q.get("srt"),
            ss: q.get("ss"),
            sp: q.get("sp"),
        };
        console.info(`[azureBlob] ${label} SAS summary:`, hint);
        const srt = (hint.srt || "").toLowerCase();
        if (srt === "s" || (srt && (!srt.includes("c") || !srt.includes("o")))) {
            console.warn(
                "[azureBlob] SAS srt is missing container and/or object — uploads will fail until you regenerate " +
                    "(Portal: resource types Service + Container + Object → srt=sco) or use AZURE_STORAGE_CONNECTION_STRING.",
            );
        }
    } catch {
        /* ignore */
    }
}

/**
 * If the URL points at a blob path (/container/a/b/c) but credentials are
 * container- or account-scoped, use only /container?query for the SDK.
 */
function normalizeBlobUrlToContainerOrAccount(blobUrl) {
    const u = new URL(blobUrl);
    const pathSegs = u.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (pathSegs.length <= 1) return blobUrl;

    const container = pathSegs[0];
    u.pathname = `/${container}`;
    const next = u.toString();
    console.warn(
        `[azureBlob] BLOB_URL had extra path segments after container "${container}"; ` +
            `using "${u.pathname}?…" for the SDK. Your SAS must allow writes to blobs in that container.`,
    );
    return next;
}

function createFromConnectionString(cs) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(cs);
    const containerName = DEFAULT_CONTAINER_NAME;
    const accountHost = accountHostFromConnectionString(cs);
    return {
        containerClient: blobServiceClient.getContainerClient(containerName),
        containerName,
        accountHost,
    };
}

/**
 * Build a container client from BLOB_URL — supports account SAS or container SAS.
 */
function createAzureClients(blobUrl) {
    const normalized = normalizeBlobUrlToContainerOrAccount(blobUrl);
    logBlobConfigHint("BLOB_URL", normalized);

    const u = new URL(normalized);
    const accountHost = u.host;
    const pathSegs = u.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

    if (pathSegs.length === 1) {
        const containerName = pathSegs[0];
        return {
            containerClient: new ContainerClient(normalized),
            containerName,
            accountHost,
        };
    }

    const blobServiceClient = new BlobServiceClient(normalized);
    return {
        containerClient: blobServiceClient.getContainerClient(DEFAULT_CONTAINER_NAME),
        containerName: DEFAULT_CONTAINER_NAME,
        accountHost,
    };
}

let containerClient = null;
let CONTAINER_NAME = DEFAULT_CONTAINER_NAME;
let ACCOUNT_HOST = null;

const conn = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();

if (conn) {
    try {
        const cfg = createFromConnectionString(conn);
        containerClient = cfg.containerClient;
        CONTAINER_NAME = cfg.containerName;
        ACCOUNT_HOST = cfg.accountHost;
        console.info("[azureBlob] Using AZURE_STORAGE_CONNECTION_STRING (container:", CONTAINER_NAME + ")");
    } catch (e) {
        console.error("[azureBlob] Invalid AZURE_STORAGE_CONNECTION_STRING:", e.message);
    }
} else if (process.env.BLOB_URL) {
    try {
        const cfg = createAzureClients(process.env.BLOB_URL);
        containerClient = cfg.containerClient;
        CONTAINER_NAME = cfg.containerName;
        ACCOUNT_HOST = cfg.accountHost;
    } catch (e) {
        console.error("[azureBlob] Invalid BLOB_URL:", e.message);
    }
}

const azureEnabled = Boolean(containerClient);

if (!azureEnabled) {
    console.warn(
        "[azureBlob] Set AZURE_STORAGE_CONNECTION_STRING (recommended) or BLOB_URL (account or container SAS). " +
            "See comments in services/azureBlob.js.",
    );
}

const compressImage = async (buffer) =>
    sharp(buffer)
        .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

function publicBlobUrl(blobName) {
    if (!ACCOUNT_HOST) return null;
    // Encode each path segment so spaces/unicode in blob names survive, while
    // preserving the `/` separators between segments.
    const encoded = blobName.split("/").map(encodeURIComponent).join("/");
    return `https://${ACCOUNT_HOST}/${CONTAINER_NAME}/${encoded}`;
}

/**
 * Upload a single multer file (memoryStorage) to Azure Blob Storage.
 * Photos are normalised to WebP + resized; videos are passed through as-is.
 */
async function uploadToAzure(file) {
    if (!azureEnabled) {
        throw new Error(
            "Azure Blob Storage is not configured (set AZURE_STORAGE_CONNECTION_STRING or BLOB_URL).",
        );
    }

    assertBlobSasCanModifyBlobs();

    const { buffer, mimetype, originalname } = file;

    const isPhoto = ALLOWED_PHOTO_TYPES.includes(mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimetype);

    if (!isPhoto && !isVideo) {
        throw new Error("Invalid file type. Only photos and videos allowed.");
    }

    const folder = isPhoto ? "gallery/photos" : "gallery/videos";
    let body = buffer;
    let contentType = mimetype;
    const ext = isPhoto ? ".webp" : path.extname(originalname) || "";
    const blobName = `${folder}/${uuidv4()}${ext}`;

    if (isPhoto) {
        body = await compressImage(buffer);
        contentType = "image/webp";
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(body, {
        blobHTTPHeaders: { blobContentType: contentType },
    });

    return {
        url: publicBlobUrl(blobName),
        key: blobName,
        type: isPhoto ? "photo" : "video",
    };
}

/** Delete a single blob by key (blob name). No-op if key is falsy. */
async function deleteFromAzure(key) {
    if (!key || !azureEnabled) return;
    assertBlobSasCanModifyBlobs();
    await containerClient.deleteBlob(key, {
        deleteSnapshots: "include",
    }).catch((err) => {
        // 404 on delete is fine — the blob is already gone.
        if (err && err.statusCode === 404) return;
        throw err;
    });
}

/**
 * Derive the blob name from a stored URL. Recognises URLs on the same account
 * host and container as our uploads.
 */
function keyFromLocationUrl(url) {
    if (!url || typeof url !== "string") return null;
    try {
        const u = new URL(url);
        if (ACCOUNT_HOST && u.host.toLowerCase() !== ACCOUNT_HOST.toLowerCase()) {
            return null;
        }
        const segments = u.pathname.split("/").filter(Boolean);
        if (segments[0] !== CONTAINER_NAME) return null;
        const blobName = segments.slice(1).map(decodeURIComponent).join("/");
        return blobName || null;
    } catch {
        return null;
    }
}

/**
 * Accepts the Game.images / KYC.profilePicture shape (string URL,
 * `{ url, key }` object, or an array of either) and returns an array of
 * blob keys that can be fed to `deleteManyFromAzure`.
 */
function collectImageKeys(images) {
    if (!images?.length) return [];
    return images
        .map((img) => {
            if (typeof img === "string") return keyFromLocationUrl(img);
            if (img && typeof img === "object" && img.key) return img.key;
            if (img && typeof img === "object" && img.url)
                return keyFromLocationUrl(img.url);
            return null;
        })
        .filter(Boolean);
}

async function deleteManyFromAzure(keys) {
    const unique = [...new Set((keys || []).filter(Boolean))];
    await Promise.all(
        unique.map((key) =>
            deleteFromAzure(key).catch((err) => {
                console.error(
                    `[azureBlob] delete failed for "${key}":`,
                    err.message
                );
            })
        )
    );
}

module.exports = {
    uploadToAzure,
    deleteFromAzure,
    deleteManyFromAzure,
    keyFromLocationUrl,
    collectImageKeys,
    azureEnabled,
    AzureSasConfigError,
    get ACCOUNT_HOST() {
        return ACCOUNT_HOST;
    },
    get CONTAINER_NAME() {
        return CONTAINER_NAME;
    },
};
