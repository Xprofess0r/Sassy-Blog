const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


/**
 * GET /
 * Admin - Login Page
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      Username: "user",
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/signin', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


/**
 * POST /
 * Admin - Check Login
*/
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      Username:'user',
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
        Username:'Add user',
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        Username: req.body.Username,
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      Username: "user",
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});


/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      Username: req.body.Username,
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

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



/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});

// POST route to handle Like action

router.post('/like-post/:id', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.userId; // Access the user ID attached by the authMiddleware
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }
  
      // Check if the user has already liked the post
      if (post.likedBy.includes(userId)) {
        return res.status(409).json({ message: 'User already liked the post.' });
      }
  
      // Increment the likes field by one and add the user ID to the likedBy array
      post.likes++;
      post.likedBy.push(userId);
  
      // Save the updated post to the database
      await post.save();
  
      res.json({ message: 'Post liked successfully.', likes: post.likes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update likes.' });
    }
  });
  


// POST route to handle unLike action

router.post('/unlike-post/:id', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.userId;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }
  
      // Check if the user has liked the post
      if (!post.likedBy.includes(userId)) {
        return res.status(409).json({ message: 'User has not liked the post.' });
      }
  
      // Decrement the likes field by one and remove the user ID from the likedBy array
      post.likes--;
      post.likedBy = post.likedBy.filter(likedUserId => likedUserId.toString() !== userId.toString());
  
      // Save the updated post to the database
      await post.save();
  
      res.json({ message: 'Post unliked successfully.', likes: post.likes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update likes.' });
    }
  });
  
  
  
  
module.exports = router;