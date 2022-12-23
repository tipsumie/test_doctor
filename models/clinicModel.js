const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    clinicName: {
      type: String,
      required: true,
    },
    clinicTel: {
      type: String,
      required: true,
    },
    clinicAddress: {
      type: String,
      required: true,
    },
    clinicWeb: {
      type: String,
    },
    clinicImage: {
      type: String,
      required: true,
    },
    timing: {
      type: Array,
      required: true,
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

const clinicModel = mongoose.model('clinics', clinicSchema);

module.exports = clinicModel;
