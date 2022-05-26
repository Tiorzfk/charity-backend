const Joi = require('joi');
const { objectId } = require('./custom.validation');

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
    title: Joi.string(),
    description: Joi.string(),
    start_at: Joi.string(),
    end_at: Joi.string(),
    location: Joi.string(),
    city: Joi.string(),
    sortBy: Joi.string(),
    search: Joi.string(),
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
      start_at: Joi.string().required(),
      end_at: Joi.string().required(),
      images: Joi.array().required(),
      location: Joi.array().required(),
      registration_deadline: Joi.string().required(),
      kuota: Joi.number(),
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
};
