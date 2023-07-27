const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function comparePassword(userPassword, enteredPassword) {
  return bcrypt.compareSync(enteredPassword, userPassword);
}
function genrateJwtToken(userMobile, password) {
  return jwt.sign(
    {
      userMobile: userMobile,
      password: password,
    },
    "test",
    { expiresIn: "30d" }
  );
}
function verifyJwtToken(token) {
    try {
      const decoded = jwt.verify(token, "test");
      return decoded;
    } catch (error) {
      // Handle token verification error
      console.error(error);
      return null;
    }
  }

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader 
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, "test", (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    // next()
  })
}
module.exports = {
  comparePassword,
  verifyJwtToken,
  genrateJwtToken,
  authenticateToken
};
