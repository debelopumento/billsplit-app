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

app.use('*', function(req, res) {
  return res.status(404).json({message: 'Not Found'});
});

app.get('/bills', (req, res) => {
  Bills
    .find()
    .limit(10)
    .exec()
    .then(bills => {
      res.json({
        bills: bills.map(
          (bills) => bills.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

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


app.post('/bills', (req, res) => {

  const requiredFields = ['billDate', 'totalAmount', 'users'];
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
      totalAmount: req.body.totalAmount,
      users: req.body.users})
    .then(
      bills => res.status(201).json(bills.apiRepr()))
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
  const updateableFields = ['billDate', 'description', 'totalAmount', 'users', 'paid', 'paidByUser', 'dueDay', 'paidOff', 'memo'];

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
