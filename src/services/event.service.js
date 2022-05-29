const httpStatus = require('http-status');
const { Event } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

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

const getParticipantEventById = async (id) => {
  return Event.findOne({'participants': {$elemMatch: {user_id: id}}}).select('participants')
};

const getParticipantsEvent = async (id, filter, options) => {
  var sortBy = options.sortBy.split(':')
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const query = [
      // Initial document match (uses index, if a suitable one is available)
      { $match: {
          _id : mongoose.Types.ObjectId(id)
        }
      },
      {$project: {_id:1, participants:1}},
      
      // Expand the scores array into a stream of documents
      { $unwind: '$participants' },

      // Filter to 'homework' scores 
      // { $match: {
      //     'scores.type': 'homework'
      // }},

      // Sort in descending order
      { $sort: {
        [sortBy[0]]: (sortBy[1]=='asc'?1:-1)
      }},

      {
          $lookup:
            {
              from: 'users',
              localField: 'participants.user_id',
              foreignField: '_id',
              as: 'users'
            }
      },

      { $unwind: '$users' },

      { $match: {
          $or: [{
            'users.name' : { $regex: '.*' + filter.search + '.*' }
          },
          {
            'users.email' : { $regex: '.*' + filter.search + '.*' }
          },
          {
            'users.no_hp' : { $regex: '.*' + filter.search + '.*' }
          },
          {
            'participants.createdAt' : { $regex: '.*' + filter.search + '.*' }
          }]
        }
      },

      // { $limit: limit },
      // { $skip: skip },

      {
        $facet: {
          edges: [
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },

  ]

  const populateEvent = await Event.aggregate(query);
  // const result = await Event.populate(populateEvent, {path: 'participants.user_id'});
  const totalParticipant = await Event.findById(id)
  const totalPages = Math.ceil((totalParticipant.participants?totalParticipant.participants.length:0) / limit);
  return {results: populateEvent[0].edges, page: page, limit: limit, totalPages: totalPages, totalResults: totalParticipant.participants?totalParticipant.participants.length:0};
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

const joinEventById = async (eventId, updateBody) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  updateBody.user_id = mongoose.Types.ObjectId(updateBody.user_id);
  event.participants.push(updateBody)

  await event.save();
  return event;
};

const verifyEvent = async (eventId, updateBody) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const eventUpd = await Event.findOneAndUpdate(
    {_id: mongoose.Types.ObjectId(eventId), participants: {$elemMatch: {user_id: updateBody.user_id}}},
    {$set: {"participants.$.is_verified": updateBody.is_verified } },
    {new: true, safe: true, upsert: true}
  )

  return eventUpd;
};

module.exports = {
  createEvent,
  queryEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  getParticipantEventById,
  joinEventById,
  getParticipantsEvent,
  verifyEvent
};
