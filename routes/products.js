var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');

// Middleware for authentication/authorization
const authMiddleware = (role) => {
  return async (req, res, next) => {
    // Assuming you have some auth system that sets req.user
    if (!req.user) {
      return res.status(401).send({
        success: false,
        message: "Authentication required"
      });
    }

    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).send({
        success: false,
        message: "Admin access required"
      });
    }

    if (role === 'mod' && !['mod', 'admin'].includes(req.user.role)) {
      return res.status(403).send({
        success: false,
        message: "Moderator or Admin access required"
      });
    }

    next();
  };
};

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, 'i');
  }
  result.price = {};
  if (query.price) {
    if (query.price.$gte) {
      result.price.$gte = Number(query.price.$gte);
    } else {
      result.price.$gte = 0;
    }
    if (query.price.$lte) {
      result.price.$lte = Number(query.price.$lte);
    } else {
      result.price.$lte = 10000;
    }
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// GET all products (no auth required)
router.get('/', async function (req, res, next) {
  console.log(BuildQuery(req.query));
  let products = await productSchema.find(BuildQuery(req.query)).populate({
    path: 'category',
    select: 'name'
  });
  res.status(200).send({
    success: true,
    data: products
  });
});

// GET single product (no auth required)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id);
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// CREATE product (mod required)
router.post('/', authMiddleware('mod'), async function (req, res, next) {
  try {
    let body = req.body;
    let category = body.category;
    let getCategory = await categorySchema.findOne({
      name: category
    });
    if (getCategory) {
      let newProduct = new productSchema({
        name: body.name,
        price: body.price ? body.price : 0,
        quantity: body.quantity ? body.quantity : 0,
        category: getCategory._id,
      });
      await newProduct.save();
      res.status(200).send({
        success: true,
        data: newProduct
      });
    } else {
      res.status(404).send({
        success: false,
        message: "category sai"
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// UPDATE product (mod required)
router.put('/:id', authMiddleware('mod'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id);
    if (product) {
      let body = req.body;
      if (body.name) product.name = body.name;
      if (body.price) product.price = body.price;
      if (body.quantity) product.quantity = body.quantity;
      if (body.category) product.category = body.category;
      await product.save();
      res.status(200).send({
        success: true,
        data: product
      });
    } else {
      res.status(404).send({
        success: false,
        message: "ID khong ton tai"
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// DELETE product (admin required)
router.delete('/:id', authMiddleware('admin'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id);
    if (product) {
      product.isDeleted = true;
      await product.save();
      res.status(200).send({
        success: true,
        data: product
      });
    } else {
      res.status(404).send({
        success: false,
        message: "ID khong ton tai"
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;