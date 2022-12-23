const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Clinic = require('../models/clinicModel');
const Appointment = require('../models/appointmentModel');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploade');
const moment = require('moment');

// Register

router.post('/register', async (req, res) => {
  try {
    // Check user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: 'มีบัญชีผู้ใช้นี้อยู่แล้ว', success: false });
    }
    // Encrypt user password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).send({ message: 'สร้างบัญชีเรียบร้อยแล้ว', success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'มีข้อผิดพลาดในการสร้างบัญชี',
      success: false,
      error,
    });
  }
});

// Login

router.post('/login', async (req, res) => {
  try {
    // Check user exist in DB
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({
        message: 'ไม่มีบัญชีผู้ใช้นี้ โปรดสร้างบัญชีผู้ใช้',
        success: false,
      });
    }

    // Check Password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: 'รหัสผ่านไม่ถูกต้อง', success: false });
    } else {
      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      });
      res
        .status(200)
        .send({ message: 'เข้าสู่ระบบสำเร็จ', success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'มีข้อผิดพลาดในการเข้าระบบ โปรดลองอีกครั้ง',
      success: false,
      error,
    });
  }
});

// Get user by Id

router.post('/user-id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;

    if (!user) {
      return res
        .status(200)
        .send({ message: 'ไม่มีบัญชีผู้ใช้นี้', success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: 'การดึงข้อมูลผู้ใช้ผิดพลาด',
      success: false,
      error,
    });
  }
});

// Add clinic

router.post(
  '/add-clinic-account',
  auth,
  upload.single('clinicImage'),
  async (req, res) => {
    try {
      // Create clinic account
      const data = req.body;
      const newData = {
        ...data,
        clinicImage: '/uploads/' + req.file.filename,
      };
      const newClinic = new Clinic(newData);
      await newClinic.save();

      //Send notification to admin
      const admin = await User.findOne({ isAdmin: true });
      const notification = admin.notification;
      notification.push({
        type: 'newClinicRequest',
        message: `คลินิค ${newClinic.clinicName} ถูกเพิ่ม`,
        data: {
          clinicId: newClinic._id,
          name: newClinic.clinicName,
        },
        onClickPath: '/admin/clinics',
      });

      await User.findByIdAndUpdate(admin._id, { notification });
      res
        .status(200)
        .send({ message: 'เพิ่มบัญชีคลินิคสำเร็จ', success: true });
    } catch (error) {
      console.log('Error', error);
      res.status(500).send({
        message: 'มีข้อผิดพลาดในการสร้างบัญชีคลินิก',
        success: false,
        error,
      });
    }
  }
);

// Delete notification

router.post('/delete-notification', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.notification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: 'ลบข้อความสำเร็จ',
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'เกิดข้อผิดพลาดในการลบแจ้งเตือน',
      success: false,
      error,
    });
  }
});

// Get all approved clinics

router.get('/all-approved-clinics', auth, async (req, res) => {
  try {
    const clinics = await Clinic.find({ status: 'อนุมัติแล้ว' });

    res.status(200).send({
      message: 'ดึงข้อมูลคลินิกสำเร็จ',
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

// Booking

router.post('/book', auth, async (req, res) => {
  try {
    req.body.date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
    req.body.time = moment(req.body.time, 'HH:mm').toISOString();

    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    // send notification to clinic admin.

    const user = await User.findOne({ _id: req.body.clinic.userId });
    user.notification.push({
      message: `มีนัดหมายใหม่จาก ${req.body.user.name}`,
      onClickPath: '/clinic/appointments',
    });
    await user.save();

    res.status(200).send({
      message: 'จองนัดหมายคลินิกสำเร็จ',
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: 'การจองคลินิกผิดพลาด',
      success: false,
      error,
    });
  }
});

// Check booking

router.post('/check-booking', auth, async (req, res) => {
  try {
    const startClinic = moment(
      req.body.clinic.timing[0],
      'HH:mm'
    ).toISOString();
    const endClinic = moment(req.body.clinic.timing[1], 'HH:mm').toISOString();
    const slectedTime = moment(req.body.time, 'HH:mm').toISOString();

    if (slectedTime < startClinic || slectedTime >= endClinic) {
      return res.status(200).send({
        message: 'คลินิกยังไม่เปิดบริการ',
        success: false,
      });
    } else {
      const date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
      const startTime = moment(req.body.time, 'HH:mm')
        .subtract(59, 'minutes')
        .toISOString();
      const endTime = moment(req.body.time, 'HH:mm')
        .add(59, 'minutes')
        .toISOString();
      const clinicId = req.body.clinicId;
      const appointments = await Appointment.find({
        clinicId,
        date,
        time: { $gte: startTime, $lte: endTime },
      });
      if (appointments.length > 0) {
        return res.status(200).send({
          message: 'การนัดหมายไม่ว่าง',
          success: false,
        });
      } else {
        return res.status(200).send({
          message: 'การนัดหมายว่าง',
          success: true,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'การตรวจสอบนัดหมายผิดพลาด',
      success: false,
      error,
    });
  }
});

// Get appointments by userId

router.get('/appointments-by-user-id', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
});

module.exports = router;
