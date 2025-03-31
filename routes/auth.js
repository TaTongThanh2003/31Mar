var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
let { check_authentication } = require("../utils/check_auth");
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

// LOGIN (no auth required)
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({
                success: false,
                message: "Username and password are required"
            });
        }
        let userId = await userControllers.checkLogin(username, password);
        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = jwt.sign({
            id: userId,
            expireIn: Date.now() + 3600 * 1000 // 1 hour from now
        }, constants.SECRET_KEY);
        res.send({
            success: true,
            data: token
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

// SIGNUP (no auth required)
router.post('/signup', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send({
                success: false,
                message: "Username, password, and email are required"
            });
        }
        let result = await userControllers.createAnUser(username, password, email, 'user');
        res.send({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

// GET CURRENT USER (auth required)
router.get('/me', check_authentication, async function (req, res, next) {
    try {
        const user = await userControllers.getUserById(req.user.id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        res.send({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

// CHANGE PASSWORD (auth required)
router.post('/changepassword', check_authentication, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        if (!oldpassword || !newpassword) {
            return res.status(400).send({
                success: false,
                message: "Old and new passwords are required"
            });
        }
        const user = await userControllers.changePassword(req.user.id, oldpassword, newpassword);
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Incorrect old password"
            });
        }
        res.send({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;