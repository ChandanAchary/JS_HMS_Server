import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const UPLOAD_DIR = "uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

if (useCloudinary) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  // ensure upload directory exists when not using Cloudinary
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // allow common image types (jpeg, jpg, png, webp) and PDFs for document uploads
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/PNG/WEBP images or PDF files are allowed"), false);
  }
};

const storage = useCloudinary ? memoryStorage : diskStorage;

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// Middleware to upload file(s) in `req.file`/`req.files` to Cloudinary when enabled.
// If Cloudinary is not configured, this is a no-op.
export const uploadToCloudinary = async (req, res, next) => {
  if (!useCloudinary) return next();

  const sendError = (err) => next(err);

  const uploadOne = (file) =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER || "hospital-uploads" },
        (error, result) => {
          if (error) return reject(error);
          // return a simplified file object
          resolve({
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        }
      );

      const readable = new Readable();
      readable._read = () => {}; // noop
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(stream);
    });

  try {
    if (req.file && req.file.buffer) {
      const uploaded = await uploadOne(req.file);
      req.file.cloudinary = uploaded;
      req.file.url = uploaded.url;
    } else if (req.files && Array.isArray(req.files)) {
      const promises = req.files.map((f) => uploadOne(f));
      const results = await Promise.all(promises);
      // attach cloudinary info next to each file
      req.files = req.files.map((f, i) => ({ ...f, cloudinary: results[i], url: results[i].url }));
    }
    // Also handle data-URI fields in the request body (e.g., client sent base64 image in `profilePhoto`)
    // Convert them to Cloudinary uploads and replace the body value with the uploaded URL.
    const candidateFields = ["profilePhoto", "profile_pic", "profilePic", "logo", "document", "file", "attachment"];
    for (const field of candidateFields) {
      const val = req.body && req.body[field];
      if (val && typeof val === "string" && val.startsWith("data:")) {
        try {
          // Upload directly from data URI; Cloudinary detects resource type
          const res = await cloudinary.uploader.upload(val, {
            folder: process.env.CLOUDINARY_FOLDER || "hospital-uploads",
            resource_type: "auto"
          });
          req.body[field] = res.secure_url || res.url;
        } catch (err) {
          // Log and continue; controller can handle missing URL
          console.warn(`uploadToCloudinary: failed to upload data-uri field ${field}:`, err.message);
        }
      }
    }
    return next();
  } catch (err) {
    return sendError(err);
  }
};

export default upload;
