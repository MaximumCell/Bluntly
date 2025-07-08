// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. In this case, it is used to handle file uploads in the user profile update route.
import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

export default upload;