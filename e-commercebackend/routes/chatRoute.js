const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controller/chatController');

router.post('/', handleMessage);

module.exports = router;
