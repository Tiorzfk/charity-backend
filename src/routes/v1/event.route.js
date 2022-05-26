const express = require('express');
const multer = require("multer");
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const eventValidation = require('../../validations/event.validation');
const eventController = require('../../controllers/event.controller');
const path = require("path");

const router = express.Router();
const upload = multer({storage: multer.diskStorage({
  destination: function (req, file, callback) { callback(null, 'uploads/');},
  filename: function (req, file, callback) { callback(null, file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname));}})
})

router
  .route('/')
  .post(auth('manageEvents'), upload.array("files"), validate(eventValidation.createEvent), eventController.createEvent)
  .get(validate(eventValidation.getEvents), eventController.getEvents);

// router
//   .route('/:eventId')
//   .get(validate(eventValidation.getUser), userController.getUser)
//   .patch(validate(eventValidation.updateUser), userController.updateUser)
//   .delete(validate(eventValidation.deleteUser), userController.deleteUser);

module.exports = router;