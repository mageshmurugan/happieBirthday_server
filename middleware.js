const jwt = require('jsonwebtoken')
const User = require('./models/user')

const protect = async (req, res, next) => {
  let token
  const {mobile}=req.body;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      // console.log(req.headers)
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      // Get user from the token
      req.user = await User.findOne({
        phone:decoded.mobile
    })
     if(decoded.mobile==mobile){
       next()
     }
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
}

module.exports = { protect }