require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 5000 || process.env.PORT;

const Post = require('./server/models/Post'); // Import the Post model
const User = require('./server/models/User'); 
Post.find({}) // Find all documents
  .then(posts => {
    // Update each document with default values
    const updates = posts.map(post => {
      if (!post.likes) {
        post.likes = Math.floor(Math.random() * 100);
      }
      post.Username = 'Anonymous_user';
      post.likedBy = [];
      return post.save();
    });

    return Promise.all(updates);
  })
  .then(updatedPosts => {
    console.log('Existing documents updated successfully.');
  })
  .catch(error => {
    console.error('Error updating documents:', error);
  });
// Update all documents to include the missing fields with default values
Post.updateMany(
  { }, // An empty filter means all documents will be updated
  { $set: { Username: 'Anonymous_user',likedBy: [] } }, // Fields to be added with default values
  { multi: true } // To update multiple documents, set the multi option to true
)
.then(() => {
  console.log('Existing documents updated successfully.');
})
.catch((err) => {
  console.error('Error updating documents:', err);
});

User.updateMany(
  {},
  {
    $set: {
      PhoneNo: 'number',
      Email: '__@gmail.com',
      DOB: new Date, // Example date of birth
      Gender: 'M/F',
    },
  },
  { multi: true }
)
  .then(() => {
    console.log('Existing users updated successfully.');
  })
  .catch((err) => {
    console.error('Error updating users:', err);
  });
  
// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
 app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  
}));

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


app.locals.isActiveRoute = isActiveRoute; 

app.use('/',require('./server/routes/main'))
// app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});