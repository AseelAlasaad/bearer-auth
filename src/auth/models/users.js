'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

const API_SECRET=process.env.API_SECRET;
const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
   
    password: { type: DataTypes.STRING, allowNull: false, },
    
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username },API_SECRET);
      }
    }
  });

  model.beforeCreate(async (user) => {
    let hashedPass =  await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({where:{ username }})
    const valid = await bcrypt.compare(password, user.password)
    if (valid) { 
      // let newToken=jwt.sign({ username: this.username },API_SECRET);
      // user.token=newToken;
      return user; 
    
    }
    throw new Error('Invalid User');
  }

  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
   
      try{const parsedToken = jwt.verify(token,API_SECRET);
      const user =await this.findOne({where:{ username: parsedToken.username }})
      if (user) 
      { return user; }
    
     else{
       throw new Error('Invalid Token');
     }
    }catch(err){
      throw new Error(err.message);
    }
  }

  return model;
}

module.exports = userSchema;