const express = require('express');
const router = express.Router();
const { register, login, deleteUser, putFavorites, getFavorites, removeFavorite,updateUser, getUser } = require('../controllers/authController.js');
const verifyToken = require ("../middilewares/authMiddileware.js");
const  authorizeRoles  = require("../middilewares/roleMiddileware.js");

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifyToken, authorizeRoles("user"), getUser);
router.put("/update/user", verifyToken, authorizeRoles("user"), updateUser);
router.delete("/delete/user", verifyToken, authorizeRoles("user"), deleteUser);
router.put("/add/favorites", verifyToken, authorizeRoles("user"), putFavorites);
router.get("/favorites", verifyToken, authorizeRoles("user"), getFavorites);
router.delete("/remove/favorites", verifyToken, authorizeRoles("user"), removeFavorite);

module.exports = router;