//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('file-system'); 
// const encrypt = require('mongoose-encryption');

// more powerfull (turns password into hash)
// const md5 = require('md5');

// EVEN MORE SECURE (random salt -> HASH after a SET NUMBER of salting rounds)
// hash-function BCRYPT
const bcrypt = require('bcrypt')

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); 

var _data = JSON.parse(fs.readFileSync('secrets_data.json', 'utf8')); 
const saltRounds = _data.number_of_salting_rounds;


mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: [true, "this field needs to be filled"],
    },
    password: {
        type: String,
        required: [true, "this field needs to be filled"],
    }
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });
const User = new mongoose.model("User", userSchema);


 



app.get('/', function(req, res){
    res.render('home');
});
app.get('/login', function(req, res){
    res.render('login');
});
app.get('/register', function(req, res){
    res.render('register');
});


app.post('/register', function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        const newUser = new User({
            email: req.body.username,
            // we do encrypt password via md5 module
            password: hash
        });
    
        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.render('secrets');
            }
        });
    })

});

app.post('/login', function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne(
        { email: username },

        function (err, foundUser) {
            if (err){
                console.log(err);
            } else {
                if (foundUser) { //exists
                    bcrypt.compare(password, foundUser.password, function(err, compareRes){
                        if(compareRes){
                            res.render('secrets');
                        }
                    })
                }
            }
        }
    )
});




app.listen(3000, function(){
    console.log('Server is running on port 3000')
});