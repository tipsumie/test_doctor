const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Clinic = require('../models/clinicModel');
const User = require('../models/userModel');

// Fetch all clinics
router.get('/get-all-clinics', auth, async (req, res) => {
  try {
    const clinics = await Clinic.find({});

    res.status(200).send({
      success: true,
      data: clinics,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การดึงข้อมูลคลินิกผิดพลาด',
      success: false,
      error,
    });
  }
});

// Fetch all users

router.get('/get-all-users', auth, async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).send({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การดึงข้อมูลผู้ใช้ผิดพลาด',
      success: false,
      error,
    });
  }
});

// Change status from user to clinic

router.post('/change-status-to-clinic', auth, async (req, res) => {
  try {
    const { clinicId, status } = req.body;
    const clinic = await Clinic.findByIdAndUpdate(clinicId, {
      status,
    });

    const user = await User.findOne({ _id: clinic.userId });
    const notification = user.notification;
    notification.push({
      message: `คลินิกบัญชีของคุณได้ ${status}`,
      onClickPath: '/',
    });

    // update role user to clinic
    user.isClinic = status === 'อนุมัติแล้ว' ? true : false;
    await user.save();

    res.status(200).send({
      message: 'เปลี่ยนสถานะเเป็นคลินิคสำเร็จ',
      success: true,
      data: clinic,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การเปลี่ยนสถานะเป็นบัญชีคลินิคผิดพลาด',
      success: false,
      error,
    });
  }
});

module.exports = router;
