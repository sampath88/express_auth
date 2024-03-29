require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

const allowlist = [
  "http://localhost:5173",
  "https://perfect-resume-sampath88.vercel.app",
];
const corsOptionsDelegate = function (req, callback) {
  console.log("cors");
  let corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Hello from auth system</h1>");
});

app.post("/api/v1/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All fields are required");
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(401).send("User already exists");
    }

    const myEncPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: myEncPassword,
    });

    //token
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token; //this won't store in database
    //update or not in DB

    //handle password situation
    user.password = undefined; //this won't store in database
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = username;

    if (!(email && password)) {
      res.status(400).send("Field is missing");
    }

    const user = await User.findOne({ email });
    // if(!user){
    //   res.status(400).send("You are not registered in our app")
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.accessToken = token;
      user.password = undefined;
      // res.status(200).json(user);

      //NOTE: if you want to use cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res
        .status(200)
        .cookie("accessToken", token, options)
        .json({ success: true, accessToken: token, user });
      return;
    }

    res.status(400).send("email or password is incorrect");
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/v1/user", auth, (req, res) => {
  res.send("Welcome to secret information");
});

module.exports = app;
