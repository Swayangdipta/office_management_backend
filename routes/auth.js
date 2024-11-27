const { createAdmin, loginAdmin, createEndUsers, loginEndUser, isSignedIn, isAdministrator } = require('../controllers/auth')

const router = require('express').Router()


router.post('/auth/admin/create',createAdmin)
router.post('/auth/admin/login',loginAdmin)
router.post('/auth/eu/add',isSignedIn,isAdministrator,createEndUsers)
router.post('/auth/eu/login',loginEndUser)

module.exports = router