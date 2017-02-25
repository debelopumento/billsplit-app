const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const colors = require('colors');

require('dotenv').config();

const {router: usersRouter} = require('./users');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
console.log('DATABASE_URL: ', DATABASE_URL);
const {Bills} = require('./models');
const {User} = require('./users/models');
const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));
app.use('/users/', usersRouter);
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/userIdabc/:id', (req, res) => {
  return User
    .findById(req.params.id)
    .exec()
    .then(user => res.json(user.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
  });
});

//all bills in db
app.get('/bills', (req, res) => {
  Bills
    .find()
    .limit(100)
    .exec()
    .then(bills => {
      res.json({
        bills: bills.map(
          bills => bills.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});


//search one bill by its Id
app.get('/bills/:id', (req, res) => {
  Bills
    .findById(req.params.id)
    .exec()
    .then(bill => res.json(bill.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});


app.get('/bills-sum-2users/:userIdInput/:friendIdInput', (req, res) => {
  Bills
    .find({$or: [{$and: [{users: {$elemMatch: {userId: req.params.friendIdInput}}}, {"paidByUser.userId": req.params.userIdInput}]}, {$and: [{users: {$elemMatch: {userId: req.params.userIdInput}}}, {"paidByUser.userId": req.params.friendIdInput}]}]})
    .exec()
    .then(bills => res.json(
          {bills: bills.map(bill => bill.apiRepr())
    }))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/bills', (req, res) => {
  const requiredFields = ['totalAmount', 'users', 'paidByUser'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  console.log(901, req.body)
  Bills
    .create({
      billDate: req.body.billDate,
      description: req.body.description,
      totalAmount: req.body.totalAmount,
      users: req.body.users,
      postedTime: req.body.postedTime,
      postedBy: req.body.postedBy,
      paid: req.body.paid,
      paidByUser: req.body.paidByUser,
      dueDay: req.body.dueDay,
      paidOff: req.body.paidOff,
      memo: req.body.memo
    })
    .then(function(updatedBill) {
      //get IDs of users that need to be updated in database
      //var usersIdCollection = {userIds: [updatedBill.paidByUser.userId]};
      const promises = updatedBill.users.map(function(localBillSplitter) {
          //console.log(99, localBillSplitter);
          if (localBillSplitter.userId != updatedBill.paidByUser.userId) {
              //usersIdCollection.userIds.push(localBillSplitter.userId);
              //console.log(99, localBillSplitter);
              return Bills
              .find({$and: [{users: {$elemMatch: {userId: updatedBill.paidByUser.userId}}}, {"paidByUser.userId": localBillSplitter.userId}]})
              .exec()
              .then(function(billsCollectionA) {
                var billPayerBalance = 0;
                var billSplitterBalance = 0;
                billsCollectionA.forEach(function(localBill) {
                  localBill.users.forEach(function(localUser) {
                    if (localUser.userId === updatedBill.paidByUser.userId) {
                      billPayerBalance = billPayerBalance - localUser.splitAmount;
                      billSplitterBalance = billSplitterBalance + localUser.splitAmount;
                    }
                  });
                });
                //console.log(102, billPayerBalance);
                
                return Bills
                .find({$and: [{users: {$elemMatch: {userId: localBillSplitter.userId}}}, {"paidByUser.userId": updatedBill.paidByUser.userId}]})
                .exec()
                .then(function(billsCollectionB) {
                  //console.log(103, billsCollectionB);
                  billsCollectionB.forEach(function(localBill) {
                    localBill.users.forEach(function(localUser) {
                      if (localUser.userId === localBillSplitter.userId) {
                        console.log(104, localUser.fullName);
                        billPayerBalance = billPayerBalance + localUser.splitAmount;
                        billSplitterBalance = billSplitterBalance - localUser.splitAmount;
                      }
                    });
                  });
                  return User
                  .findById(updatedBill.paidByUser.userId)
                  .exec()
                  .then(function(billPayer) {
                    console.log(310)
                    let friendSubDocId = ''
                    billPayer.friends.forEach(function(friend) {
                      if (friend.userId === localBillSplitter.userId) {
                        friendSubDocId = friend._id
                      }
                    })
                    let friendSubDoc = billPayer.friends.id(friendSubDocId)
                    friendSubDoc.balance = billSplitterBalance
                    billPayer.save()
                    
                    return User
                    .findById(localBillSplitter.userId)
                    .exec()
                    .then(function(toBeUpdatedBillSplitter) {
                        toBeUpdatedBillSplitter.friends.forEach(function(friend) {
                          if (friend.userId === updatedBill.paidByUser.userId) {
                            friend.balance = billPayerBalance;
                          }
                        });
                        console.log(311)
                        //updateUser(localBillSplitter.userId, toBeUpdatedBillSplitter)
                        return User
                        .findByIdAndUpdate(localBillSplitter.userId, toBeUpdatedBillSplitter)                        
                    })
                  })
                })                
              })
          }
      });
    Promise.all(promises)
    .then(bills => res.json(updatedBill))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    })
    })
});


app.put('/bills/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['description', 'totalAmount', 'users', 'paid', 'paidOff', 'memo'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Bills
    //find old bill in database, name is oldBill.
    .findById(req.params.id)
    .exec()
    .then(function(oldBill) {
      console.log("old bill: ".rainbow, oldBill);
      //var newBill = {$set: toUpdate};
      var newBill = req.body;
      console.log("updated bill: ".rainbow, newBill);
      Bills
      .findByIdAndUpdate(req.params.id, newBill)
      .exec()
      //update bill in database, name it updatedBill.
      .then(function() {
        //combine users array from old bill and updated bill
        var updatedBill = newBill;
        let toUpdateUsers = updatedBill.users;
        oldBill.users.forEach(function(oldUser) {
          //check if this old user is still in updated bill's user list
          var userIsInUpdatedList = false;
          updatedBill.users.forEach(function(newUser) {
            if (oldUser.userId === newUser.userId) {
              userIsInUpdatedList = true;
            }
          });
          if (userIsInUpdatedList === false) {
            toUpdateUsers.push(oldUser);
          }
        });
        //update balances
        const promises = toUpdateUsers.map(function(localBillSplitter) {
            if (localBillSplitter.userId != updatedBill.paidByUser.userId) {
                Bills
                .find({$and: [{users: {$elemMatch: {userId: updatedBill.paidByUser.userId}}}, {"paidByUser.userId": localBillSplitter.userId}]})
                .exec()
                .then(function(billsCollectionA) {
                  var billPayerBalance = 0;
                  var billSplitterBalance = 0;
                  billsCollectionA.forEach(function(localBill) {
                    localBill.users.forEach(function(localUser) {
                      if (localUser.userId === updatedBill.paidByUser.userId) {
                        billPayerBalance = billPayerBalance - localUser.splitAmount;
                        billSplitterBalance = billSplitterBalance + localUser.splitAmount;
                      }
                    });
                  });
                  
                  Bills
                  .find({$and: [{users: {$elemMatch: {userId: localBillSplitter.userId}}}, {"paidByUser.userId": updatedBill.paidByUser.userId}]})
                  .exec()
                  .then(function(billsCollectionB) {
                    //console.log(103, billsCollectionB);
                    billsCollectionB.forEach(function(localBill) {
                      localBill.users.forEach(function(localUser) {
                        if (localUser.userId === localBillSplitter.userId) {
                          console.log(104, localUser.fullName);
                          billPayerBalance = billPayerBalance + localUser.splitAmount;
                          billSplitterBalance = billSplitterBalance - localUser.splitAmount;
                        }
                      });
                    });

                    return User
                      .findById(updatedBill.paidByUser.userId)
                      .exec()
                      .then(function(billPayer) {
                        console.log(310)
                        let friendSubDocId = ''
                        billPayer.friends.forEach(function(friend) {
                          if (friend.userId === localBillSplitter.userId) {
                            friendSubDocId = friend._id
                          }
                        })
                        let friendSubDoc = billPayer.friends.id(friendSubDocId)
                        friendSubDoc.balance = billSplitterBalance
                        billPayer.save()
                        
                        return User
                        .findById(localBillSplitter.userId)
                        .exec()
                        .then(function(toBeUpdatedBillSplitter) {
                            toBeUpdatedBillSplitter.friends.forEach(function(friend) {
                              if (friend.userId === updatedBill.paidByUser.userId) {
                                friend.balance = billPayerBalance;
                              }
                            });
                            console.log(311)
                            return User
                            .findByIdAndUpdate(localBillSplitter.userId, toBeUpdatedBillSplitter)                            
                        })
                        
                      })
                  })
                  .then(bills => res.status(204).end())
                  .catch(err => {
                    console.error(err);
                    res.status(500).json({message: 'Internal server error'})
                  });

                })
                .then(bills => res.status(204).end())
                .catch(err => {
                  console.error(err);
                  res.status(500).json({message: 'Internal server error'})
                });

            }
        })
        Promise.all(promises)
        .then(bills => res.status(204).end())
        .catch(err => {
          console.error(err);
          res.status(500).json({message: 'Internal server error'});
        });
      })
    })
    .then(bills => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));

});

app.delete('/bills/:id', (req, res) => {
  Bills
    .findById(req.params.id)
    .exec()
    .then(function(updatedBill) {
      //get info od updatedBill
      console.log(505, updatedBill);

      //remove bill
      Bills
      .findByIdAndRemove(updatedBill.id)
      .exec()
      
      .then(function(updatedBill) {
      //get IDs of users that need to be updated in database
      const promises = updatedBill.users.map(function(localBillSplitter) {
          //console.log(99, localBillSplitter);
          if (localBillSplitter.userId != updatedBill.paidByUser.userId) {
              //usersIdCollection.userIds.push(localBillSplitter.userId);
              //console.log(99, localBillSplitter);
              return Bills
              .find({$and: [{users: {$elemMatch: {userId: updatedBill.paidByUser.userId}}}, {"paidByUser.userId": localBillSplitter.userId}]})
              .exec()
              .then(function(billsCollectionA) {
                var billPayerBalance = 0;
                var billSplitterBalance = 0;
                billsCollectionA.forEach(function(localBill) {
                  localBill.users.forEach(function(localUser) {
                    if (localUser.userId === updatedBill.paidByUser.userId) {
                      billPayerBalance = billPayerBalance - localUser.splitAmount;
                      billSplitterBalance = billSplitterBalance + localUser.splitAmount;
                    }
                  });
                });
                //console.log(102, billPayerBalance);
                return Bills
                .find({$and: [{users: {$elemMatch: {userId: localBillSplitter.userId}}}, {"paidByUser.userId": updatedBill.paidByUser.userId}]})
                .exec()
                .then(function(billsCollectionB) {
                  //console.log(103, billsCollectionB);
                  billsCollectionB.forEach(function(localBill) {
                    localBill.users.forEach(function(localUser) {
                      if (localUser.userId === localBillSplitter.userId) {
                        console.log(104, localUser.fullName);
                        billPayerBalance = billPayerBalance + localUser.splitAmount;
                        billSplitterBalance = billSplitterBalance - localUser.splitAmount;
                      }
                    });
                  });
                  //get users from users database and update them
                    

                    return User
                    .findById(updatedBill.paidByUser.userId)
                    .exec()
                    .then(function(billPayer) {
                      console.log(310)
                      let friendSubDocId = ''
                      billPayer.friends.forEach(function(friend) {
                        if (friend.userId === localBillSplitter.userId) {
                          friendSubDocId = friend._id
                        }
                      })
                      let friendSubDoc = billPayer.friends.id(friendSubDocId)
                      friendSubDoc.balance = billSplitterBalance
                      billPayer.save()
                      return User
                      .findById(localBillSplitter.userId)
                      .exec()
                      .then(function(toBeUpdatedBillSplitter) {
                          toBeUpdatedBillSplitter.friends.forEach(function(friend) {
                            if (friend.userId === updatedBill.paidByUser.userId) {
                              friend.balance = billPayerBalance;
                            }
                          })
                          return User
                          .findByIdAndUpdate(localBillSplitter.userId, toBeUpdatedBillSplitter)                                  
                      })
                    })




                  })
                })
                
            }
        })
      Promise.all(promises)
      
      .then(bill => res.status(204).end())
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
      })      
      })
    })
    .then(bills => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));

});





app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});





let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
