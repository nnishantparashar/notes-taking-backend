const jwt = require("jsonwebtoken");

exports.isAuth = async (req, res, next) => {
  
  const token = req.headers.authorization.split(" ")[1];
  
  if (token) {
    let obj = await jwt.verify(token, process.env.SECRET_KEY);
  // const { cookies } = req;
  // if (cookies.accessToken) {
  //   let obj = await jwt.verify(cookies.accessToken, process.env.SECRET_KEY);

    req._id = obj._id;
    if (!obj._id) {
      return res.status(401).send({
        message: "Not Authenticated",
      });
    }
    return next();
  }
  return res.status(401).send({
    message: "Not Authenticated",
  });
};
