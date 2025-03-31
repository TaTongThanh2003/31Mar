var express = require('express');
const { token } = require('morgan');
var router = express.Router();
var userControllers = require('../controllers/users');
let jwt = require('jsonwebtoken');
let { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

// GET all users (mod required)
router.get('/',
  check_authentication,
  check_authorization(['mod', 'admin']),
  async function (req, res, next) {
    try {
      let users = await userControllers.getAllUsers();
      // Filter out the current user's own data if they're not admin
      if (req.user.role !== 'admin') {
        users = users.filter(user => user._id.toString() !== req.user.id);
      }
      res.send({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET user by ID (mod required, can't get own ID unless admin)
router.get('/:id',
  check_authentication,
  check_authorization(['mod', 'admin']),
  async function (req, res, next) {
    try {
      if (req.user.role !== 'admin' && req.params.id === req.user.id) {
        return res.status(403).send({
          success: false,
          message: "Cannot access own user data"
        });
      }
      let user = await userControllers.getUserById(req.params.id);
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
      next(error);
    }
  }
);

// CREATE user (admin required)
router.post('/',
  check_authentication,
  check_authorization([constants.ADMIN_PERMISSION]),
  async function (req, res, next) {
    try {
      let body = req.body;
      let newUser = await userControllers.createAnUser(
        body.username,
        body.password,
        body.email,
        body.role
      );
      res.status(200).send({
        success: true,
        message: newUser
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  }
);

// UPDATE user (admin required)
router.put('/:id',
  check_authentication,
  check_authorization([constants.ADMIN_PERMISSION]),
  async function (req, res, next) {
    try {
      let body = req.body;
      let updatedUser = await userControllers.updateAnUser(req.params.id, body);
      res.status(200).send({
        success: true,
        message: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE user (admin required)
router.delete('/:id',
  check_authentication,
  check_authorization([constants.ADMIN_PERMISSION]),
  async function (req, res, next) {
    try {
      let deleteUser = await userControllers.deleteAnUser(req.params.id);
      res.status(200).send({
        success: true,
        message: deleteUser
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;