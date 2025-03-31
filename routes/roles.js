var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
let { check_authentication, check_authorization } = require("../utils/check_auth");

// GET all roles (no auth required)
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// CREATE role (admin required)
router.post('/',
  check_authentication,
  check_authorization(['admin']),
  async function (req, res, next) {
    try {
      let body = req.body;
      let newRole = new roleSchema({
        name: body.name
      });
      await newRole.save();
      res.send({
        success: true,
        data: newRole
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

// UPDATE role (admin required)
router.put('/:id',
  check_authentication,
  check_authorization(['admin']),
  async function (req, res, next) {
    try {
      let role = await roleSchema.findById(req.params.id);
      if (!role) {
        return res.status(404).send({
          success: false,
          message: "Role not found"
        });
      }
      role.name = req.body.name || role.name;
      await role.save();
      res.send({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

// DELETE role (admin required)
router.delete('/:id',
  check_authentication,
  check_authorization(['admin']),
  async function (req, res, next) {
    try {
      let role = await roleSchema.findById(req.params.id);
      if (!role) {
        return res.status(404).send({
          success: false,
          message: "Role not found"
        });
      }
      await roleSchema.deleteOne({ _id: req.params.id });
      res.send({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

module.exports = router;