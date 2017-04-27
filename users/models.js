const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: String,
  facebookId: String,
  friends: [
    {
      fullName: String,
      userId: String,
      balance: Number,
    },
  ],
});

UserSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    facebookId: this.facebookId,
    username: this.username || '',
    fullName: this.fullName || '',
    friends: this.friends,
  };
};

const User = mongoose.model('User', UserSchema, 'userscollection');

module.exports = { User };
