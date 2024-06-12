require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const restrictedArea = async (req, res, next) => {
  const token = req.body.token || req.cookies.token;
  try {
    if (token) {
      if (token) {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        if (payload) {
          req.user = payload;
          next();
        } else {
          res.status(400).json({ error: "token verification failed" });
        }
      } else {
        res.status(400).json({ error: "malformed auth header" });
      }
    } else {
      res.redirect("/loginPage");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

// export custom middleware
module.exports = {
  restrictedArea,
};
