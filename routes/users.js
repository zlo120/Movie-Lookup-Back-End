var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const JWT_SECRET = "SJHSfsious8df7ShdsdhjasjkldSSAFuehtjknsdfm";

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

  // Check to see if all the required body data is given
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  // Storing all the required data in variables
  const email = req.body.email;
  const password = req.body.password;

  let bearerExpires = req.body.bearerExpiresInSeconds;
  let refreshExpires = req.body.refreshExpiresInSeconds;

  // checking to see if the expiry time has been given
  if (!bearerExpires) {
    bearerExpires = 86400;
  }

  if (!refreshExpires) {
    refreshExpires = 600;
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
          .count("*")
          .where("email", email)
          .then(user => {
            const exists = user[0]['count(*)'];

            if (!exists) {
              req.db
                .insert({
                  email: email,
                  bearerToken: bearerToken,
                  bearerExpiry: bearerExpires,
                  refreshToken: refreshToken,
                  refreshExpiry: refreshExpires
                })
                .into('tokens')
                .then(result => {
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
                })
            }
            else {
              req.db
                .from('tokens')
                .where('email', email)
                .update({
                  bearerToken: bearerToken,
                  bearerExpiry: bearerExpires,
                  refreshToken: refreshToken,
                  refreshExpiry: refreshExpires
                })
                .then(result => {
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
                });
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

router.post('/logout', function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({
      "error": true,
      "message": "Request body incomplete, refresh token required"
    });
  }

  return req.db
    .from('tokens')
    .select('refreshToken')
    .where('refreshToken', refreshToken)
    .then(result => {

      if (result[0] === undefined) {
        return res.status(401).json({ error: true, message: "Invalid JWT token" });
      }

      const token = result[0].refreshToken;

      // validate token
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          return res.status(401).json({ error: true, message: "JWT token has expired" });
        }
        else {
          req.db
            .from('tokens')
            .where('refreshToken', token)
            .del()
            .then(response => {
              return res.status(200).json({ error: false, message: "Token successfully invalited" });
            });
        }
      })
    })
});

router.post('/refresh', function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({
      "error": true,
      "message": "Request body incomplete, refresh token required"
    });
  }

  return req.db
    .from('tokens')
    .select('refreshToken')
    .where('refreshToken', refreshToken)
    .then(result => {

      if (result[0] === undefined) {
        return res.status(401).json({ error: true, message: "Invalid JWT token" });
      }

      const token = result[0].refreshToken;

      // validate token
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          return res.status(401).json({ error: true, message: "JWT token has expired" });
        }
        else {
          // refresh the token here
          let bearerToken = jwt.sign({
            email: decoded.email,
            exp: Math.floor(Date.now() / 1000) + 86400
          },
            JWT_SECRET);

          let refreshToken = jwt.sign({
            email: decoded.email,
            exp: Math.floor(Date.now() / 1000) + 600
          },
            JWT_SECRET)

          req.db
            .from('tokens')
            .where('email', decoded.email)
            .update({
              bearerToken: bearerToken,
              bearerExpiry: 86400,
              refreshToken: refreshToken,
              refreshExpiry: 600
            })
            .then(result => {
              return res.status(200).json({
                bearerToken: {
                  token: bearerToken,
                  token_type: "Bearer",
                  expires_in: 86400
                },
                refreshToken: {
                  token: refreshToken,
                  token_type: "Refresh",
                  expires_in: 600
                }
              });
            });


        }
      })
    })
});


// profile stuff
router.get('/:email/profile', function (req, res) {
  const email = req.params.email;

  // Authenticate user
  // check if user is authorized
  if (!("authorization" in req.headers)
    || !req.headers.authorization.match(/^Bearer /)
  ) {
    return req.db
      .from('users')
      .select('*')
      .where('email', email)
      .then(result => {
        // user not found
        if (result[0] === undefined) {
          return res.status(404).json({
            error: true,
            message: "User not found"
          });
        }

        const user = result[0];

        return res.json({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      })
  }

  if (req.headers.authorization === undefined) {
    return res.status(401).json({ error: true, message: "Authorization header is malformed" });
  }

  const token = req.headers.authorization.replace(/^Bearer /, "");

  return jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      req.db
        .from('tokens')
        .where('bearerToken', token)
        .then(response => {

          if (response[0] === undefined) {
            return res.status(401).json({ error: true, message: "Invalid JWT token" });
          }

          return res.status(401).json({ error: true, message: "JWT token has expired" });

        });
    }
    else {
      // search for email
      return req.db
        .from('users')
        .select('*')
        .where('email', email)
        .then(result => {
          // user not found
          if (result[0] === undefined) {
            return res.status(404).json({
              error: true,
              message: "User not found"
            });
          }

          const user = result[0];

          return res.json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            dob: user.dob,
            address: user.address
          });
        })
    }
  })
});

router.put('/:email/profile', function (req, res) {
  const email = req.params.email;

  return req.db
    .from('users')
    .select('*')
    .where('email', email)
    .then(results => {

      if (results[0] === undefined) {
        return res.status(404).json({
          error: true,
          message: "User not found"
        });
      }

      // Authenticate first
      if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /)
      ) {
        return res.status(401).json({
          error: true,
          message: "Authorization header ('Bearer token') not found"
        });
      }

      const token = req.headers.authorization.replace(/^Bearer /, "");

      return jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {

          return req.db
            .from('tokens')
            .where("bearerToken", token)
            .then(result => {
              if (result[0] === undefined) {

                return res.status(401).json({
                  error: true,
                  message: "Invalid JWT token"
                });

              }
              else {

                return res.status(401).json({
                  error: true,
                  message: "JWT token has expired"
                });

              }
            })
        }
        else {
          const firstName = req.body.firstName;
          const lastName = req.body.lastName;
          const dob = req.body.dob;
          const address = req.body.address;

          if (decoded.email !== email) {
            return (res.status(403).json({
              error: true,
              message: "Forbidden"
            }
            ));
          }

          let updateUserData = {};

          if (firstName !== undefined) {
            updateUserData.firstName = firstName;
          }

          if (lastName !== undefined) {
            updateUserData.lastName = lastName;
          }

          if (dob !== undefined) {
            updateUserData.dob = dob;
          }

          if (address !== undefined) {
            updateUserData.address = address;
          }

          return req.db
            .from('users')
            .where("email", email)
            .update(updateUserData)
            .then(response => {
              console.log(response);
              return res.json(updateUserData);
            });

        }
      });
    })
});

module.exports = router;