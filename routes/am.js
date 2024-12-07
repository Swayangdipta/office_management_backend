const { is, isSignedIn } = require('../controllers/auth');

const router = require('express').Router()

router.param('euId', getEndUserById)

router.post('/am/parties/:euId',get)
