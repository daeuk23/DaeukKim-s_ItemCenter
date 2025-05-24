const bcrypt = require('bcryptjs');

// require the mongoose module and create a Schema variable that points to mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// userSchema
const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginHistory: [{
        dateTime: {
            type: Date,
            default: Date.now
        },
        userAgent: String
    }]
});

let User; // to be defined on new connection
module.exports = {
    User: User,
    userSchema: userSchema,
    //given function
    initialize: function () {
        return new Promise(function (resolve, reject) {
            // my mongodb connection
            let db = mongoose.createConnection("mongodb+srv://kimdaeuk7601:873FhkmJwFwXdnPs@dbs311.vedqs2r.mongodb.net/?retryWrites=true&w=majority&appName=dbs311");
            db.on('error', (err) => {
                reject(err); // Reject the promise 
            });

            db.once('open', () => {
                User = db.model("users", userSchema);
                resolve(); // Resolve the promise 
            });
        });
    },
  
    registerUser: function(userData) {
        return new Promise(function(resolve, reject) {
            if (userData.password !== userData.password2) {
                reject("Passwords do not match");
            } else {
                // updated using bcrypt
                bcrypt.hash(userData.password, 10)
                    .then(hash => {
                        userData.password = hash;
                        let newUser = new User(userData);
                        // Save new user
                        newUser.save()
                            .then(() => {
                                resolve(); // Resolve the promise 
                            })
                            .catch(err => {
                                // if statement :duplicate
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                } else {
                                    reject("There was an error creating the user: " + err);
                                }
                            });
                    })
                    .catch(err => {
                        reject("There was an error encrypting the password"); // updated using bcrypt
                    });
            }
        });
    }, 
  
    checkUser: function(userData) {
        return new Promise((resolve, reject) => {
          User.findOne({ userName: userData.userName })
            .then(user => {
              if (!user) {
                reject('Unable to find user: ' + userData.userName);
              } else {
                bcrypt.compare(userData.password, user.password).then(result => {
                  if (result) {
                    user.loginHistory.push({
                      dateTime: new Date().toString(),
                      userAgent: userData.userAgent
                    });
                    user.save()
                    .then(updatedUser => {
                        resolve(updatedUser);
                      })
                      .catch(err => {
                        reject('There was an error verifying the user: ' + err);
                      });
                  } else {
                    reject('Incorrect Password for user: ' + userData.userName);
                  }
                }).catch(err => {
                  reject('There was an error verifying the user: ' + userData.userName);
                });
              }
            })
            .catch(err => {
              reject('Unable to find user: ');
            });
        });
      }
  };