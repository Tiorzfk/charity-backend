const httpStatus = require('http-status');
const { Event } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createEvent = async (userBody) => {
  return Event.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryEvents = async (filter, options) => {
  const event = await Event.paginate(filter, options);
  return event;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getEventById = async (id) => {
  return Event.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateEventById = async (eventId, updateBody, files) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  JSON.parse(updateBody.files_remove).forEach(async function(val) {
    await Event.findOneAndUpdate( { _id : eventId}, { 
      $pull : { 
        images : {_id: val._id}
      } 
    },
    { multi : true }  
    )
  })

  updateBody.images = files.concat(event.images)

  delete updateBody.files_remove;
  Object.assign(event, updateBody);

  await event.save();
  return event;
};

/**
 * Delete user by id
 * @param {ObjectId} eventId
 * @returns {Promise<User>}
 */
const deleteEventById = async (eventId) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await event.remove();
  return event;
};

module.exports = {
  createEvent,
  queryEvents,
  getEventById,
  getUserByEmail,
  updateEventById,
  deleteEventById,
};
