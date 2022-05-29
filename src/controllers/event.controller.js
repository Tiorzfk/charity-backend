const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { eventService, userService } = require('../services');
const fs = require('fs');

const createEvent = catchAsync(async (req, res) => {
  req.body.images = req.files
  const event = await eventService.createEvent(req.body);
  res.status(httpStatus.CREATED).send(event);
});

const getEvents = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'title']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await eventService.queryEvents(filter, options);
  res.send(result);
});

const getEvent = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  res.send(event);
});

const updateEvent = catchAsync(async (req, res) => {
  var files_remove = JSON.parse(req.body.files_remove)
  files_remove.forEach((val) => {
    fs.unlink(val.path, (err => {
      if (err) console.log(err);
      else {
        console.log("\nfile Deleted ");
      }
    }));
  })

  const event = await eventService.updateEventById(req.params.eventId, req.body, req.files);
  res.send(event);
});

const deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEventById(req.params.eventId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getEventParticipant = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'title']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const event = await eventService.getParticipantsEvent(req.params.eventId, filter, options);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  res.send(event);
});

const joinParticipant = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.body.user_id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  var participant = await eventService.getParticipantEventById(req.body.user_id);
  if(!participant)
  {
    await eventService.joinEventById(req.params.eventId, req.body);
  }
  
  res.status(httpStatus.CREATED).send(user);
});

const verifyParticipant = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.body.user_id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  var verify = await eventService.verifyEvent(req.params.eventId, req.body);
  
  res.status(httpStatus.CREATED).send(verify);
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventParticipant,
  joinParticipant,
  verifyParticipant
};
