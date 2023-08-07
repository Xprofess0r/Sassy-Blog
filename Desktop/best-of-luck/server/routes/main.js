const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const jwtSecret = process.env.JWT_SECRET;
router.get('', async (req, res) => {


  try {
    const locals = {
        Username:"Anonymus",
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }

      let perPage = 10;
      let page = req.query.page || 1;
  
      const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
  
      const count = await Post.count();
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);
  
      res.render('index', { 
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute: '/'
      }); 

  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
    try {
      let slug = req.params.id;
  
      const data = await Post.findById({ _id: slug });
  
      const locals = {
        Username: data.Username,
        title: data.title,
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
        likes: data.likes
      }
  
      res.render('post', { 
        locals,
        data,
        currentRoute: `/post/${slug}`
      });
    } catch (error) {
      console.log(error);
    }
  
  });


/**
 * POST /
 * Post - searchTerm
*/
router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Search",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
  
      const data = await Post.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
          { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      });
  
      res.render("search", {
        data,
        locals,
        currentRoute: '/'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });






router.get('/register',(req,res) => {
    res.render('register',{
   currentRoute: '/register' 
    });
});

/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password, Email, PhoneNo, DOB, Gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        username,
        password: hashedPassword,
        Email,
        PhoneNo,
        DOB,
        Gender
      });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already in use' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


function insertPostData () {
  Post.insertMany([
    {
      Username:"Anonymus",
      title: "Building APIs with Node.js",
      body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
    },

  ])
}

insertPostData();
module.exports = router;