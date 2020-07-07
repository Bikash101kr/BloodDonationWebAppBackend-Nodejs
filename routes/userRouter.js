const express = require ('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/User');

const jwt = require ('jsonwebtoken');

const validation = require('../validation');

router.post('/register', (req, res, next) => {

    let { username, password, firstName, lastName, phone, address} = req.body;
    User.findOne({username})
    .then((user) => {
        if (user) {
            let err = new Error('User already exists!');
            err.status = 401;
            return next(err);
        }
        bcrypt.hash(password, 10)
        .then(hashed => {
            User.create({username, password: hashed, firstName, lastName, address, phone})
            .then((user)=>{
                res.json(user);
            }).catch(next);
        }).catch(next);
        
    }).catch(next);

})
router.post('/login', (req, res, next) => {
    let { username, password} = req.body;
    User.findOne({username})
    .then((user) => {
        if (!user) {
            let err = new Error('User not found ');
            err.status = 401;
            return next(err);
        }
        bcrypt.compare(password, user.password)
        .then((isMatched) => {
            if(!isMatched){
                let err = new Error('password does not match');
                err.status = 401;
                return next(err);
            }
            let payload = {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                phone: user.phone

            }
            jwt.sign(payload, process.env.SECRET, (err,token)=> {
                if(err){
                    return next(err);
                }
                res.json({
                    status: 'Login Sucessful',
                    token: `Bearer ${token}`
                });
            });
            

        }).catch(next);
    }).catch(next);
    router.get('/logout', (req, res) => {
        req.logout();
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
      });

})

module.exports = router;