const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;


const UserSchema = mongoose.Schema({
  
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {type: String, default: ""},
  friends: [{
    fullName: {type: String, required: true},
    id: {type: String, required: true},
    balance: {type: Number, required: true}
  }]
});

UserSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    username: this.username || '',
    fullName: this.fullName || '',
    friends: this.friends,
    balance: this.balance
  };
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema, "userscollection");

module.exports = {User};