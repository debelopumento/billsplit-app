const mongoose = require('mongoose');

const billsSchema = mongoose.Schema({
  //id: {type: String, required: true},
  billDate: {type: Date, required: true},
  description: String,
  totalAmount: {type: Number, required: true},
  users: [{id: {type: String, required: true},
           fullName: String,
           splitAmount: {type: Number, required: true}
    }],
  postedTime: {type: Date, default: Date.now},
  postedBy: {userId: {type: String, required: true}, 
      fullName: String
  },
  paid: {type: Boolean, required: true},
  paidByUser: {userId: {type: String, required: true}, 
      fullName: String
  },
  dueDay: Date,
  paidOff: {type: Boolean, required: true},
  memo: String
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
    dueDay: this.dueDay,
    paidOff: this.paidOff,
    memo: this.memo
  };
}


const Bills = mongoose.model('Bills', billsSchema, "billscollection");

module.exports = {Bills};
