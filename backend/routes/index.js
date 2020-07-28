const express = require('express');

const router = express.Router();

/**
 * GET /api-status - Check service status
 */
router
    .route('/api-status')
    .get(function (req, res) {
        res.json({status: 'ok'})
    });

module.exports = router;