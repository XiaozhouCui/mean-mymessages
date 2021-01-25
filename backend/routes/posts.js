const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const PostController = require("../controllers/posts");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// save posted file to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // check if file type is included in MIME_TYPE_MAP
    const isValid = MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error("invalid mime type");
    // destination path is relative to server.js
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

// multer({storage}).single("image") will extract a fime form req.body.image
router.post(
  "",
  checkAuth,
  multer({ storage }).single("image"),
  PostController.createPost
);

router.get("", PostController.getPosts);

router.get("/:id", PostController.getPost);

router.put(
  "/:id",
  checkAuth,
  multer({ storage }).single("image"),
  PostController.updatePost
);

router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
