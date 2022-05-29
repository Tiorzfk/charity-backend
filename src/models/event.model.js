const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const slugify = require('slugify')
const ImgSchema = mongoose.Schema(
  { 
    fieldname: String, 
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number
  }
);

const ParticipantSchema = mongoose.Schema(
  { 
    is_verified: {
      type: Number,
      default: 0
    }, 
    file: {
      type: ImgSchema,
      default: null
    }, 
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    start_at: {
      type: Date,
      required: true,
      trim: true,
    },
    end_at: {
      type: Date,
      required: true,
      trim: true,
    },
    images: [ImgSchema],
    registration_deadline: {
      type: Date,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    kuota: {
      type: Number,
      trim: true
    },
    slug: {
      type: String,
      trim: true
    },
    participants: [ParticipantSchema]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
eventSchema.plugin(toJSON);
eventSchema.plugin(paginate);


eventSchema.pre('save', async function (next) {
  const event = this;
  event.slug = await slugify(event.title);
  next();
});

/**
 * @typedef Event
 */
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
