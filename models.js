const mongoose = require('mongoose');

const billsSchema = mongoose.Schema({
  billDate: Date,
  description: String,
  totalAmount: { type: Number, required: true },
  users: [
    {
      userId: String,
      fullName: String,
      splitAmount: Number,
    },
  ],
  postedTime: Date,
  postedBy: {
    userId: String,
    fullName: String,
  },
  paid: Boolean,
  paidByUser: {
    userId: String,
    fullName: String,
  },
  paidOff: Boolean,
  memo: String,
});

billsSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    billDate: this.billDate,
    description: this.description,
    totalAmount: this.totalAmount,
    users: this.users,
    postedTime: this.postedTime,
    postedBy: this.postedBy,
    paid: this.paid,
    paidByUser: this.paidByUser,
    //dueDay: this.dueDay,
    paidOff: this.paidOff,
    memo: this.memo,
  };
};

const Bills = mongoose.model('Bills', billsSchema, 'billscollection');

module.exports = { Bills };
