const jwt = require("jsonwebtoken");

//model is optional

const auth = (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(403).send("token is missing");
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);
    req.user = decode; //attach decoded information to the req, so it will be usefull in next() process
    // you can also make a db call and bring in more info from DB. if needed.
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

module.exports = auth;
