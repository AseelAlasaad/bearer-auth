'use strict';

const express = require('express');
const authRouter = express.Router();

const { users } = require('./models/index.js');
const basicAuth = require('./middleware/basic.js')
const bearerAuth = require('./middleware/bearer.js')

authRouter.post('/signup', async (req, res, next) => {
  try {
    let userRecord = await users.create(req.body);
    const output = {
      user: userRecord,
      token: userRecord.token
    };
    res.status(201).json(output);
  } catch (e) {
    next("Error occurred");
  }
});

authRouter.post('/signin', basicAuth, (req, res, next) => {
  const userInfo = {
    user: req.user,
    token: req.user.token
  };
  res.status(200).json(userInfo);
});

authRouter.get('/users', bearerAuth, async (req, res, next) => {
  try{const usersInfo = await users.findAll({});
  const list = usersInfo.map(user => user.username);
  res.status(200).json(list);}
  catch(err){
     next(err.message);
  }
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send("Welcome to the secret area!")
});


module.exports = authRouter;