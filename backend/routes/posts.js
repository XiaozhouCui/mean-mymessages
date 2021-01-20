const express = require("express");
const multer = require("multer");

const Post = require("../models/post");

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

// multer(storage).single("image") will extract a fime form req.body.image
router.post("", multer(storage).single("image"), async (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });
  const newPost = await post.save();
  // console.log(newPost);
  res.status(201).json({
    message: "Post added successfully",
    postId: newPost._id,
  });
});

router.get("", (req, res, next) => {
  Post.find().then((posts) => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts,
    });
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

router.put("/:id", (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
  });
  Post.updateOne({ _id: req.params.id }, post).then((result) => {
    // console.log(result);
    res.status(200).json({ message: "Update successful" });
  });
});

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    // console.log(result);
    res.status(200).json({ message: "Post deleted" });
  });
});

module.exports = router;
