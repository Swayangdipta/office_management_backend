const { getAdminById, createDesignation } = require('../controllers/admin')

const router = require('express').Router()

router.param('adminId',getAdminById)

router.post('/admin/cr/designation',createDesignation)

module.exports = router