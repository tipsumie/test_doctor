const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Clinic = require('../models/clinicModel');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

// Get clinic by user ID

router.post('/clinic-by-user-id', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ userId: req.body.userId });

    res.status(200).send({
      success: true,
      message: 'การดึงข้อมูลคลินิกสำเร็จ',
      data: clinic,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การดึงข้อมูลคลินิกผิดพลาด',
      success: false,
      error,
    });
  }
});

// Update  clinic profile

router.post('/update-clinic-profile', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findOneAndUpdate(
      {
        userId: req.body.userId,
      },
      req.body
    );

    res.status(200).send({
      success: true,
      message: 'การแก้ไขข้อมูลคลินิกสำเร็จ',
      data: clinic,
    });
  } catch (error) {
    res.status(500).send({
      message: 'อัปเดตข้อมูลคลินิกผิดพลาด',
      success: false,
      error,
    });
  }
});

// Get clinic details by ID

router.post('/clinic-by-id', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ _id: req.body.clinicId });

    res.status(200).send({
      success: true,
      message: 'การดึงข้อมูลคลินิกสำเร็จ',
      data: clinic,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การดึงข้อมูลคลินิกผิดพลาด',
      success: false,
      error,
    });
  }
});

// Get appointments by clinicId

router.get('/appointments-by-clinic-id', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ userId: req.body.userId });
    const appointments = await Appointment.find({ clinicId: clinic._id });
    res.status(200).send({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'การดึงข้อมูลนัดหมายคลินิกผิดพลาด',
      error,
    });
  }
});

// Change appointments status

router.post('/change-appointment-status', auth, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });
    // send notification to user(patient)
    const user = await User.findOne({ _id: appointment.userId });
    const notification = user.notification;
    notification.push({
      message: `การนัดหมายของคุณ ${status}`,
      onClickPath: '/appointments',
    });
    await user.save();

    res.status(200).send({
      message: 'การเปลี่ยนสถานะนัดหมายสำเร็จ',
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'การเปลี่ยนสถานะนัดหมายผิดพลาด',
      success: false,
      error,
    });
  }
});

module.exports = router;
