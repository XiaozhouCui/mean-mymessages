const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result,
        });
      })
      .catch((err) => {
        console.log(err.code);
        if (err.code == 11000) {
          return res.status(400).json({
            message: "Email already exists, please try another one",
          });
        }
        res.status(400).json({ message: "Invalid authentication credentials" });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      // check if user exists
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      // check if bcrypt.compare() returns true
      if (!result) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // sign jwt and send it in response
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      res.status(200).json({
        token,
        expiresIn: 3600 * 12,
        userId: fetchedUser._id,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ message: "Login failed" });
    });
};
