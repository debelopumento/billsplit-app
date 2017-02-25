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
    .limit(30)
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
      //console.log(101, updatedBill);
      const promisesB = updatedBill.users.map(function(localBillSplitter) {
          //console.log(99, localBillSplitter);
          if (localBillSplitter.userId != updatedBill.paidByUser.userId) {
              //usersIdCollection.userIds.push(localBillSplitter.userId);
              //console.log(99, localBillSplitter);
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
                //console.log(102, billPayerBalance);
                
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
                  console.log(105, billPayerBalance);
                  //get users from users database and update them
                    //find bill-payer
                    User
                    .findById(updatedBill.paidByUser.userId)
                    .exec()
                    //.then(user => res.json(user.apiRepr()))
                    .then(function(billPayer) {
                      //console.log(40, billPayer);
                      billPayer.friends.forEach(function(friend) {
                        if (friend.userId === localBillSplitter.userId) {
                          friend.balance = billSplitterBalance;
                        }
                      });
                      //console.log(40, billPayer);
                      var updateTheseUsers = [];
                      updateTheseUsers.push(billPayer);

                      User
                      .findById(localBillSplitter.userId)
                      .exec()
                      .then(function(toBeUpdatedBillSplitter) {
                          toBeUpdatedBillSplitter.friends.forEach(function(friend) {
                            if (friend.userId === updatedBill.paidByUser.userId) {
                              friend.balance = billPayerBalance;
                            }
                            updateTheseUsers.push(toBeUpdatedBillSplitter);
                          });
                          
                          //update these users
                          const promises = updateTheseUsers.map(function(updateThisUser) {
                              return User
                              .findByIdAndUpdate(updateThisUser._id, updateThisUser)
                              .exec()
                          });
                          return Promise.all(promises);

                          /*
                          Promise.all(promises)
                              .then(function() {
                                console.log('hello'.red);
                                console.log(updatedBill);
                                Bills
                                .findById(updatedBill._id)
                                .exec()
                                .then(bill => res.json(bill.apiRepr()))
                                .catch(err => {
                                  console.error(err);
                                    res.status(500).json({message: 'Internal server error'})
                                });
                                
                              })
                              .then(user => res.status(204).end())
                              .catch(err => res.status(500).json({message: 'Internal server error'}));
                          */


                      })
                      .then(user => res.status(204).end())
                      .catch(err => {
                        console.error(err);
                          res.status(500).json({message: 'Internal server error'})
                      });
                    })
                    .then(user => res.status(204).end())
                    .catch(err => {
                      console.error(err);
                        res.status(500).json({message: 'Internal server error'})
                    });
                    //update bill-splitter



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
      });
    Promise.all(promisesB)
    .then(bills => res.json(updatedBill))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
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
    .then(function(deletedBill) {
      //get info od deletedBill
      console.log(505, deletedBill);

      //remove bill
      Bills
      .findByIdAndRemove(deletedBill.id)
      .exec()
      .then(function(deletedBill) {
      //get IDs of users that need to be updated in database
      //var usersIdCollection = {userIds: [updatedBill.paidByUser.userId]};
      //console.log(101, updatedBill);
      deletedBill.users.forEach(function(localBillSplitter) {
          //console.log(99, localBillSplitter);
          if (localBillSplitter.userId != deletedBill.paidByUser.userId) {
              //usersIdCollection.userIds.push(localBillSplitter.userId);
              //console.log(99, localBillSplitter);
              Bills
              .find({$and: [{users: {$elemMatch: {userId: deletedBill.paidByUser.userId}}}, {"paidByUser.userId": localBillSplitter.userId}]})
              .exec()
              .then(function(billsCollectionA) {
                var billPayerBalance = 0;
                var billSplitterBalance = 0;
                billsCollectionA.forEach(function(localBill) {
                  localBill.users.forEach(function(localUser) {
                    if (localUser.userId === deletedBill.paidByUser.userId) {
                      billPayerBalance = billPayerBalance - localUser.splitAmount;
                      billSplitterBalance = billSplitterBalance + localUser.splitAmount;
                    }
                  });
                });
                //console.log(102, billPayerBalance);
                
                Bills
                .find({$and: [{users: {$elemMatch: {userId: localBillSplitter.userId}}}, {"paidByUser.userId": deletedBill.paidByUser.userId}]})
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
                  console.log(105, billPayerBalance);
                  //get users from users database and update them
                    //find bill-payer
                    User
                    .findById(deletedBill.paidByUser.userId)
                    .exec()
                    //.then(user => res.json(user.apiRepr()))
                    .then(function(billPayer) {
                      //console.log(40, billPayer);
                      billPayer.friends.forEach(function(friend) {
                        if (friend.userId === localBillSplitter.userId) {
                          friend.balance = billSplitterBalance;
                        }
                      });
                      //console.log(40, billPayer);
                      var updateTheseUsers = [];
                      updateTheseUsers.push(billPayer);

                      User
                      .findById(localBillSplitter.userId)
                      .exec()
                      .then(function(toBeUpdatedBillSplitter) {
                          toBeUpdatedBillSplitter.friends.forEach(function(friend) {
                            if (friend.userId === deletedBill.paidByUser.userId) {
                              friend.balance = billPayerBalance;
                            }
                            updateTheseUsers.push(toBeUpdatedBillSplitter);
                          });
                          
                          //update these users
                          const promises = updateTheseUsers.map(function(updateThisUser) {
                              return User
                              .findByIdAndUpdate(updateThisUser._id, updateThisUser)
                              .exec()
                          });
                            Promise.all(promises)
                              .then(user => res.status(204).end())
                              .catch(err => res.status(500).json({message: 'Internal server error'}));

                      })
                      .then(user => res.status(204).end())
                      .catch(err => {
                        console.error(err);
                          res.status(500).json({message: 'Internal server error'})
                      });
                    })
                    .then(user => res.status(204).end())
                    .catch(err => {
                      console.error(err);
                        res.status(500).json({message: 'Internal server error'})
                    });
                    //update bill-splitter



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
      });

    })
      .then(bills => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));

      //update balance

      
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
