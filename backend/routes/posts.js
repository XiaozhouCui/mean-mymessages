const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

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

// multer({storage}).single("image") will extract a fime form req.body.image
router.post(
  "",
  checkAuth,
  multer({ storage }).single("image"),
  async (req, res, next) => {
    const url = `${req.protocol}://${req.get("host")}`;
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${req.file.filename}`,
      creator: req.userData.userId, // req.userData was added in checkAuth middleware
    });
    const newPost = await post.save();
    // console.log(newPost);
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...newPost,
        id: newPost._id,
      },
    });
  }
);

router.get("", (req, res, next) => {
  // backend pagination
  const pageSize = parseInt(req.query.pagesize);
  const currentPage = parseInt(req.query.page);
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((posts) => {
      fetchedPosts = posts;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count,
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

router.put(
  "/:id",
  checkAuth,
  multer({ storage }).single("image"),
  (req, res, next) => {
    // in default update, no file is uploaded, only an image url string
    let imagePath = req.body.imagePath;
    // if a file (not a url string) is included,
    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}`;
      imagePath = `${url}/images/${req.file.filename}`;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath,
      creator: req.userData.userId,
    });
    // only select the post created by the requesting user
    Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    ).then((result) => {
      if (result.nModified > 0)
        return res.status(200).json({ message: "Update successful" });
      return res.status(401).json({ message: "Not authorised" });
    });
  }
);

router.delete("/:id", checkAuth, (req, res, next) => {
  // only the user who create the post can delete it
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
    (result) => {
      if (result.n > 0)
        return res.status(201).json({ message: "Delete successful" });
      return res.status(401).json({ message: "Not authorised" });
    }
  );
});

module.exports = router;
