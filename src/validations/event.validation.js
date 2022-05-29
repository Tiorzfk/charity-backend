const Joi = require('joi');
const { objectId } = require('./custom.validation');

const joinParticipant = {
  body: {
      user_id: Joi.string().required(),
  }
};

const verifyParticipant = {
  body: {
    user_id: Joi.string().required(),
    is_verified: Joi.number().required(),
  }
};

const createEvent = {
  body: {
      title: Joi.string().required(),
      description: Joi.string().required(),
      start_at: Joi.date().required(),
      end_at: Joi.date().required(),
      location: Joi.string().required(),
      city: Joi.string().required(),
      registration_deadline: Joi.string().required(),
      kuota: Joi.number(),
  },
  files: Joi.array().required()
};

const getEvents = {
  query: Joi.object().keys({
    title: Joi.string().allow(null, ''),
    sortBy: Joi.string().allow(null, ''),
    search: Joi.string().allow(null, ''),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId),
  }),
};

const updateEvent = {
  params: Joi.object().keys({
    eventId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      start_at: Joi.date().required(),
      end_at: Joi.date().required(),
      location: Joi.string().required(),
      city: Joi.string().required(),
      registration_deadline: Joi.string().required(),
      kuota: Joi.number(),
      files: Joi.array(),
      files_remove: Joi.string()
    })
    .min(1),
};

const deleteEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  joinParticipant,
  verifyParticipant
};
