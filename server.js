const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

require('dotenv').config();

const {router: usersRouter} = require('./users');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
console.log('DATABASE_URL: ', DATABASE_URL);
const {Bills} = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));
app.use('/users/', usersRouter);
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


//all bills in db
app.get('/bills', (req, res) => {
  Bills
    .find()
    .limit(10)
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
    .then(bill =>res.json(bill.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

/*
app.get('/bills-user/:userIdInput', (req, res) => {
  Bills
    .find({users: {$elemMatch: {userId: req.params.userIdInput}}})
    .exec()
    .then(bills => {
        res.json({
          bills: bills.map(
            bills => bills.apiRepr())
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});
*/

//seach for bills paid by user
app.get('/bills-paidByUser/:userIdInput', (req, res) => {
  Bills
    .find({"paidByUser.userId": req.params.userIdInput})
    .exec()
    .then(bills => {
        res.json({
          bills: bills.map(
            bills => bills.apiRepr())
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});

app.get('/bills-sum/:userIdInput/:friendIdInput', (req, res) => {
  Bills
    .find({$and: [{users: {$elemMatch: {userId: req.params.userIdInput}}}, {"paidByUser.userId": req.params.friendIdInput}]})
    .exec()
    .then(bills => res.json(
          {bills: bills.map(bill => bill.apiRepr())
    }))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});


/*
app.get('/bills-user/:userIdInput/:friendIdInput', (req, res) => {
  Bills
    .find({$and: [{users: {$elemMatch: {userId: req.params.userIdInput}}}, {"paidByUser.userId": req.params.friendIdInput}]})
    .exec()
    .then(bills => res.json(
          {bills: bills.map(bill => bill.apiRepr())
    }))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});

*/

app.post('/bills', (req, res) => {
  const requiredFields = ['totalAmount', 'users'];
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
    .then(
      bill => res.status(201).json(bill.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
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
  const updateableFields = ['description', 'totalAmount', 'users', 'paid', 'paidByUser', 'paidOff'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Bills
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(bills => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/bills/:id', (req, res) => {
  Bills
    .findByIdAndRemove(req.params.id)
    .exec()
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
