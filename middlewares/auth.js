const jwt = require('jsonwebtoken');

// Every time in the middleware wii check the token
//validate JWT token with the req.body
module.exports = async (req, res, next) => {
  try {
    // Authorized user
    const token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: 'การอนุญาตสิทธิ์การเข้าถึงล้มเหลว',
          success: false,
        });
      } else {
        req.body.userId = decoded.id;
        next();
      }
    });
  } catch (error) {
    return res.status(401).send({
      message: 'การอนุญาตสิทธิ์การเข้าถึงล้มเหลว',
      success: false,
    });
  }
};
