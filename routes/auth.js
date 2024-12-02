const { getAdminById } = require('../controllers/admin')
const { createAdmin, loginAdmin, createEndUsers, loginEndUser, isSignedIn, isAdministrator } = require('../controllers/auth')

const router = require('express').Router()

router.param('adminId',getAdminById)

router.post('/auth/admin/create',createAdmin)
router.post('/auth/admin/login',loginAdmin)
router.post('/auth/eu/add/:adminId',isSignedIn,isAdministrator,createEndUsers)
router.post('/auth/eu/login',loginEndUser)

module.exports = router