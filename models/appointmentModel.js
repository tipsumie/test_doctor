const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    clinicId: {
      type: String,
      required: true,
    },
    clinic: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
    },
    status: {
      type: String,
      default: 'รอดำเนินการ',
    },
  },
  {
    timestamps: true,
  }
);

const appointmentModel = mongoose.model('appointments', appointmentSchema);

module.exports = appointmentModel;
