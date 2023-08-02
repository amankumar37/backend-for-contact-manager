const express = require('express');
const User = require('./model/User')
const Contact = require('./model/Contact')
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');



mongoose.connect('mongodb://127.0.0.1:27017/ContactDB');



// middlewares

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('hello');

})


// Login api

app.post('/login', async (req, res) => {




    const doc = await User.findOne({ Email: req.body.email, Password: req.body.password });

    if (doc) {
        const token = jwt.sign({
            name: doc.FirstName,
            email: doc.Email
        }, 'secret');
        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false });
    }
})


// Signup api


app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Check for unique email

    let doc = await User.findOne({ Email: email });


    if (doc) {
        res.status(403).send("email already exists");
        return;
    }
    else {
        const newUser = await User.create({
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            Email: req.body.email,
            Password: req.body.password
        })
        return res.json({ status: 'ok' })
    }






})


// add contact api

app.post('/add', async (req, res) => {
   
    const decoded =  jwt.verify(req.body.token, 'secret');
   
    

    try {
        const email = decoded.email;
        const user = await User.findOne({ Email: email });
        const newContact = await Contact.create({
            name: req.body.name,
            email: req.body.email,
            id:user._id
        })

        return res.json({status:'ok', contact:newContact});

 
    } catch {
        console.log("Error in adding contact server side");
        res.json({ status: 'error', error: 'invalid token' });

    }
 
})

// when the user logs in it will fetch the contacts once

app.post('/fetch-contacts',async (req,res)=>{
      const decode = jwt.verify(req.body.token,'secret');
      try{
          const user = await User.findOne({Email:decode.email});
          const contacts = await Contact.find({id:user._id});
          res.json({status:'ok',contacts:contacts});
      }catch{
        console.log("There is an error in fetching contacts server side ");
        res.json({status:'error', error:'user not logged in'});
      }
})

// delete contacts api

app.post('/delete-contact',async (req, res)=>{
       const decode  = jwt.verify(req.body.token, 'secret');
       try{
           Contact.findOneAndDelete({_id:req.body.id})
           .then(()=>{
            res.json({status:'ok'});
                   
           }).catch((err)=>{
            console.log("There is an error in deleting the user in server side ", err);
           })
       }catch{
        console.log("There is an error in deleting contact server side");
        res.json({status:'error'});
       }
})



// firing up the server



app.listen(8000, function (err) {
    if (err) {
        alert("there is an error in starting the app");
        return;
    }

    console.log("app started successfully");
})  