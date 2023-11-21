const express = require("express");
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword, verifyAccount, activateAccount, } = require('../controllers/auth.controller');

//Register
router.post("/register", register);
//Login
router.post("/login", login);
//Logout
router.get("/logout", logout);
//Forgot-Password
router.post("/forgot-password", forgotPassword);
//Reset-Password
router.post("/reset-password", resetPassword);
//Activate-Account
router.post("/activate-account", activateAccount);


module.exports = router;