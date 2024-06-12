const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { restrictedArea } = require("../middlewares/userAuth");
router.get("/", userController.getIndex);

// router.get("/add-movies-page", restrictedArea, userController.addMoviesPage);

// router.post("/add-movie", userController.addMovie);
router.get("/signupPage", userController.signupPage);
router.post("/signup", userController.signup);
router.get("/loginPage", userController.loginPage);
router.post("/login", userController.login);
router.get("/navprofile", userController.navprofile);

router.get("/logoutLink", restrictedArea, userController.logout);
router.post("/addToCart", restrictedArea, userController.addToCart);
router.get("/addList", restrictedArea, userController.addListPage);
router.delete(
  "/delete/:movieId",
  restrictedArea,
  userController.deleteFromList
);
router.get("/search", userController.search);
module.exports = router;
