const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = `${req.protocol}://${req.get("host")}`;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: `${url}/images/${req.file.filename}`,
    creator: req.userData.userId, // req.userData was added in checkAuth middleware
  });
  post
    .save()
    .then((newPost) => {
      // console.log(newPost);
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...newPost,
          id: newPost._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Creating a post failed!" });
    });
};

exports.updatePost = (req, res, next) => {
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
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.n > 0)
        return res.status(200).json({ message: "Update successful" });
      return res.status(401).json({ message: "Not authorised" });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't update post!",
      });
    });
};

exports.getPosts = (req, res, next) => {
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
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed",
      });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching post failed",
      });
    });
};

exports.deletePost = (req, res, next) => {
  // only the user who create the post can delete it
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0)
        return res.status(201).json({ message: "Delete successful" });
      return res.status(401).json({ message: "Not authorised" });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Deleting post failed!",
      });
    });
};
