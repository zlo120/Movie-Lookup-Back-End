var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

var router = express.Router();

router.post('/register', function (req, res) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  const email = req.body.email;
  const password = req.body.password;

  const saltRounds = 10;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  req.db
    .insert({
      email: email,
      pwd_hash: hash
    })
    .into('users')
    .then(response => {
      return res.status(201).json({ message: "User created" });
    })
    .catch(err => {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: true, message: "User already exists" });
      }
    })
});

router.post('/login', function (req, res) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  const email = req.body.email;
  const password = req.body.password;

  let bearerExpires = req.body.bearerExpiresInSeconds;
  let refreshExpires = req.body.refreshExpiresInSeconds;

  if (!bearerExpires) {
    bearerExpires = 600;
  }

  if (!refreshExpires) {
    refreshExpires = 86400;
  }

  return req.db
    .from("users")
    .select("*")
    .where("email", email)
    .then(response => {
      const user = response[0];

      if (user === undefined) {
        return res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        })
      }

      const JWT_SECRET = "SJHSfsious8df7ShdsdhjasjkldSSAFuehtjknsdfm";

      if (bcrypt.compareSync(password, user.pwd_hash)) {
        let bearerToken = jwt.sign({
          email: email,
          exp: Math.floor(Date.now() / 1000) + bearerExpires
        },
          JWT_SECRET);

        let refreshToken = jwt.sign({
          email: email,
          exp: Math.floor(Date.now() / 1000) + refreshExpires
        },
          JWT_SECRET)

        // save tokens into database
        req.db
          .from('tokens')
          .select("*")
          .where("email", email)
          .then(user => {
            console.log(user);
          })

        // req.db
        //   .insert({
        //     email: email,
        //     bearerToken: bearerToken,
        //     bearerExpiry: bearerExpires,
        //     refreshToken: refreshToken,
        //     refreshExpiry: refreshExpires
        //   })
        //   .into('tokens');

        return res.status(200).json({
          bearerToken: {
            token: bearerToken,
            token_type: "Bearer",
            expires_in: bearerExpires
          },
          refreshToken: {
            token: refreshToken,
            token_type: "Refresh",
            expires_in: refreshExpires
          }
        });
      }
      else {
        return res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        })
      }

    })
});

module.exports = router;