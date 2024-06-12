const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
exports.getIndex = async (req, res) => {
  try {
    res.render("home", {
      movies: [],
      error:
        "Explore movies easily..... Search for favorites and add them to your playlist. Enjoy browsing!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
exports.search = async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).send("Title is required");
  }
  // console.log(title);
  // console.log(process.env.OMDB_API_KEY);
  const key = process.env.OMDB_API_KEY;
  const response = await axios.get(
    `http://www.omdbapi.com/?s=${title}&apikey=${key}`
  );
  // console.log(response.data);
  if (response.data && response.data.Search) {
    const movies = response.data.Search;
    res.render("home", { movies });
  } else {
    // Handle case when no movies are found
    res.render("home", { movies: [], error: "not Found" }); // Sending an empty array to indicate no movies found
  }
};

exports.signupPage = async (req, res) => {
  try {
    res.render("signupPage");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
exports.loginPage = async (req, res) => {
  try {
    res.render("loginPage");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Exist",
      });
    }
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "error in hashing password",
      });
    }
    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });
    res.redirect("/loginPage");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registered",
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.render("error404");
    }
    const payload = {
      email: user.email,
      id: user._id,
      role: user.role,
      username: user.username,
    };
    if (await bcrypt.compare(password, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, redirect to login page
        return res.redirect("/login");
      }
      user = user.toObject();
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      // console.log(token);
      res.cookie("token", token, options);
      return res.redirect("/");
    } else {
      return res.render("error404");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login failure",
    });
  }
};
exports.navprofile = async (req, res) => {
  try {
    const token = req.cookies.token;
    // console.log(token);
    if (token) {
      res.status(200).json({ message: "token is found" });
      // console.log(token);
      // res.status(200).json({ cartCount });
    } else {
      res.status(404).json({ message: "token not found" });
      console.log("na h");
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.logout = (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie("token");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "logout failure",
    });
  }
};
exports.addToCart = async (req, res) => {
  try {
    const { title, img } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    // const movie = await Movies.findById(movieId);
    // if (!movie) {
    //   return res.status(404).json({ message: "movie not found" });
    // }
    const existingCartItem = user.cart.find((item) => item.title === title);

    if (existingCartItem) {
      console.log("already h");
    } else {
      user.cart.push({ title: title, img: img });
    }
    await user.save();
    res.json({ message: "Movie added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addListPage = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await User.findById(userId);

  // const movies = await User.findById(userId).select("cart.movie");
  const cartWithMovies = [];
  for (const cartItem of user.cart) {
    // Assuming each cart item has `title` and `img` fields for movie details
    cartWithMovies.push({
      title: cartItem.title,
      img: cartItem.img,
    });
  }
  res.render("AddListPage", { user, cartWithMovies });
};
exports.deleteFromList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    user.cart = user.cart.filter(
      (cartItem) => cartItem.movie.toString() !== movieId
    );
    await user.save();
    res.send({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).send({
      error: "An error occurred while deleting the movie from the cart",
    });
  }
};
