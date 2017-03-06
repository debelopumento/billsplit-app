



const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);




router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, facebookId, fullName} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }



  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
    })
    .then(hash => {
      return User
        .create({
          username: username,
          fullName: fullName,
          facebookId: facebookId,
          friends: req.body.friends
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
});


router.get('/', (req, res) => {
  return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});

router.get('/userId/:id', (req, res) => {
  return User
    .findById(req.params.id)
    .exec()
    .then(user => res.json(user.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

//get a group of users by their ids
router.get('/getUsers/:input', (req, res) => {  
  var usernameCollectionString = req.params.input;
  var usernameCollectionArray = JSON.parse(usernameCollectionString);
  return User
    .find({_id: {$in: usernameCollectionArray}})
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});


//search for a user by username
router.get('/username/:username', (req, res) => {
  return User
    .findOne({username: req.params.username})
    .exec()
    .then(user =>res.json(user.apiRepr()))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});

//search for a user by facebookId
router.get('/facebookId/:facebookId', (req, res) => {
  return User
    .findOne({facebookId: req.params.facebookId})
    .exec()
    .then(user =>res.json(user.apiRepr()))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});


//completely overwrite user info
router.put('/userUpdate/:id', (req, res) => {
  return User
    .findByIdAndUpdate(req.params.id, {$set: req.body})
    .exec()
    .then(user => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

//udpate multiple users. req body is {"updatedUsers": []}
router.put('/usersUpdate/', (req, res) => {
  //console.log(req.body.updatedUsers);
  req.body.users.forEach(function(currentUser) {
    console.log(currentUser);
    return User
    .findByIdAndUpdate(currentUser.id, currentUser)
    .exec()
    .then(user => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
  });
});




// NB: at time of writing, passport uses callbacks, not promises
const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});


passport.use(basicStrategy);
router.use(passport.initialize());

router.get('/me',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.json({user: req.user.apiRepr()})
);


module.exports = {router};
