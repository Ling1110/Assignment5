const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
require('dotenv').config(); 

var userSchema = new Schema({
    "userName": {
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});

let User; //to be defined on new connection (see initialize)

exports.initialize = () => {
    return new Promise((resolve,reject) => {
        let db = mongoose.createConnection("mongodb+srv://wlerin1991:wl19910911l.@cluster0.jitfpt8.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        })
        db.once('open', () => {
            User = db.model("Users",userSchema);
            resolve("connected to mongodb"  );
        })
    })
};


exports.registerUser = async (userData) => {
    return new Promise(async (resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            try {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(userData.password, salt);

                userData.password = hash;

                const newUser = new User(userData);
                await newUser.save();

                resolve();
            } catch (err) {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the user: " + err);
                }
            }
        }
    });
};

/*exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then(users => {
            bcrypt.compare(userData.password, users[0].password).then(res => {
                if(res === true) {   
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                    User.update(
                        { userName: users[0].userName },
                        { $set: {loginHistory: users[0].loginHistory} },
                        { multi: false }
                    )
                    .exec()
                    .then(() => {resolve(users[0])})
                    .catch(err => {reject("There was an error verifying the user: " + err)})
                }
                else {
                    reject("Incorrect Password for user: " + userData.userName); 
                }
            })
        })
        .catch(() => { 
            reject("Unable to find user: " + userData.userName); 
        }) 
    })
};*/


exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .exec()
            .then(user => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, user.password).then(res => {
                        if (res === true) {
                            user.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });

                            User.updateOne(
                                { userName: user.userName },
                                { $set: { loginHistory: user.loginHistory } }
                            )
                                .exec()
                                .then(() => {
                                    resolve(user);
                                })
                                .catch(err => {
                                    reject("There was an error verifying the user: " + err);
                                });
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    });
                }
            })
            .catch(err => {
                reject("Error finding user: " + userData.userName + " - " + err);
            });
    });
};