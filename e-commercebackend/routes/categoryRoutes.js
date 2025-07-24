const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { createCategory, getCategories , deleteCategory, updateCategory} = require("../controller/categoryController");

router.post("/add", upload.single("image"), createCategory);
router.get("/", getCategories);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory)

module.exports = router;