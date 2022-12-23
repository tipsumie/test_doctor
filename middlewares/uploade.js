const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      'file-' +
        Date.now() +
        '.' +
        file.originalname.split('.')[file.originalname.split('.').length - 1]
    );
  },
});

const maxSize = 6* 1024 ** 2; // 6MB 
const fileFilterMiddleware = (req, file, cb) => {
  const fileSize = parseInt(req.headers['content-length']);

  if (
    (file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg') &&
    fileSize <= maxSize
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage });

module.exports = upload;
