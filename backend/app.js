const bodyParser = require("body-parser");
const express = require("express");
const Post = require("./models/post");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });
  console.log(post);
  res.status(201).json({
    message: "Post added successfully",
  });
});

app.get("/api/posts", (req, res, next) => {
  const posts = [
    {
      id: "f56ds7a876d",
      title: "First server-side post",
      content: "This is coming from the server",
    },
    {
      id: "j54cv98fscz",
      title: "Second server-side post",
      content: "This is coming from the server!",
    },
  ];
  return res.status(200).json({
    message: "Posts fetched successfully!",
    posts: posts,
  });
});

module.exports = app;
