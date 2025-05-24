var express = require('express');
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;
var storeService = require('./store-service');

var exphbs  = require('express-handlebars');

//for parse
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//a6 auth service
const authData = require('./auth-service');
const clientSessions = require('client-sessions');

app.use(clientSessions({
  cookieName: 'session', 
  secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
  duration:  2 * 60 * 1000, 
  activeDuration:  1000 * 60
}));
//function for accessing session
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  else{ //case if user logined
    next(); 
  }
}

//adding routs
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const userData = req.body;
authData.registerUser(userData)
.then(() => {
    // If successively created
    res.render('register', { successMessage: "User created" });          
})
.catch(err => {
  console.log(err);
    // case fail
    const userName = req.body && req.body.userName ? req.body.userName : '';
    res.render('register', { errorMessage: err, userName: userName });
     // res.render('register', { errorMessage: err, userName: req.body.userName }) : couldnt handle nothing case
});
});

app.post('/login', (req, res) => {
  //extraction
  const { userName, password } = req.body;

  // Invoke the checkUser method with user data
  authData.checkUser(req.body)
      .then(user => {
          // If successively logined
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory,
              userAgent: req.get('User-Agent')
          };
          res.redirect('/items');
      })
      .catch(err => {
          // If login fails
          const userName = req.body && req.body.userName ? req.body.userName : '';
          res.render('register', { errorMessage: err, userName: userName });
          // res.render('register', { errorMessage: err, userName: req.body.userName }) : couldnt handle nothing case
      });
});

app.get('/logout', (req, res) => {
  //starting with reset
  req.session.reset();
  res.redirect('/');
});

//protected by ensureLogin
app.get('/userHistory', ensureLogin, (req, res) => {
  // Extract user session data 
  const { user } = req.session;
  res.render('userHistory', { user });
});



//given format date
const formatDate = function(dateObj){
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  let day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

//handlebar setting
const Handlebars = require('handlebars');

Handlebars.registerHelper('formatDate', formatDate);

Handlebars.registerHelper('safeHTML', function(options) {
  return new Handlebars.SafeString(options.fn(this));
});

//set up middleware
app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//helperfunctions
const hbs = exphbs.create({ 
  extname: ".hbs",
  helpers: {
    navLink: function (url, options) {
      return (
        '<li class="nav-item"><a ' +
        (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') +
        ' href="' +
        url +
        '">' +
        options.fn(this) +
        "</a></li>"
      );
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
});

// Set up Handlebars
app.engine('hbs', hbs.engine); 
app.set('view engine', 'hbs');


const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary setting
cloudinary.config({
    cloud_name: 'dwpgml0yl',
    api_key: '832178426417749',
    api_secret: 'MEWdeOiYTGaQq7EhjKY_AcJdM2g',
    secure: true
});

//uploading without disk memory usage
const upload = multer();

app.use(express.urlencoded({ extended: true }));

// Route to render the form for adding a new category
app.get('/categories/add',ensureLogin, (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add', ensureLogin, (req, res) => {
  const categoryData = req.body;
  storeService.addCategory(categoryData)
    .then(() => {
      res.redirect('/categories');
    })
    .catch(error => {
      res.status(500).send("Unable to add category: " + error.message);
    });
});

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
  const categoryId = req.params.id;
  storeService.deleteCategoryById(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch(error => {
      res.status(500).send("Unable to remove category / Category not found: " + error.message);
    });
});

app.get('/items/delete/:id', ensureLogin, (req, res) => {
  const itemId = req.params.id;
  storeService.deletePostById(itemId)
    .then(() => {
      res.redirect('/items');
    })
    .catch(error => {
      res.status(500).send("Unable to remove item / Item not found: " + error.message);
    });
});


//Serving static files
app.use(express.static('public'));

    // Redirect to about.html page initially when the app opens
    app.get('/', (req, res) => {
      res.redirect('/shop');
    });

    // Render the about view instead of sending about.html
    app.get('/about', (req, res) => {
      res.render('about');
    });

    //rout for addItem
    app.get('/items/add', ensureLogin, (req, res) => {
      // Call the getCategories() function from store-service to retrieve all categories
      storeService.getCategories()
        .then(categories => {
          // Render the "addItem" view and pass the categories data
          res.render('addItem', { categories: categories });
        })
        .catch(error => {
          // If there was an error fetching categories, render the "addItem" view with an empty array for categories
          res.render('addItem', { categories: [] });
        });
    });
    
    app.post('/items/add', ensureLogin, upload.single('featureImage'), (req, res) => {
      if (req.file) {
        let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };
    
    
      async function uploadingData(req) {
        try {
        let result = await streamUpload(req);
        console.log(result);
        processItem(result.secure_url);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        processItem('');
      }
      }
    
      uploadingData(req);
    }else{
      processItem("");
    }
    
    function processItem(imageUrl){
    
        // Get current server time
        const currentDate = new Date();
        // Formatted date => need this func because couldn't extract postDate from given data's
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const postDate = `${year}-${month}-${day}`;
    
      req.body.featureImage = imageUrl;
      req.body.postDate = postDate;
      req.body.category = parseInt(req.body.category);
    
      storeService.addItem(req.body)
        .then(() => {
            // redirect when it successively proceed
            res.redirect('/items');
        })
        .catch((error) => {
            // case when error
            console.error('Error adding item:', error);
            res.status(500).send('Error adding item');
        });
    }
    });

    // replace app.get(shop)
    app.get("/shop", async (req, res) => {
      // Declare an object to store properties for the view
      let viewData = {};
    
      try {
        // declare empty array to hold "post" objects
        let items = [];
    
        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
          // Obtain the published "posts" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
          // Obtain the published "items"
          items = await storeService.getPublishedItems();
        }
    
        // sort the published items by postDate
        items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    
        // get the latest post from the front of the list (element 0)
        let post = items[0];
    
        // store the "items" and "post" data in the viewData object (to be passed to the view)
        viewData.items = items;
        viewData.post = post;
      } catch (err) {
        viewData.message = "no results";
      }
    
      try {
        // Obtain the full list of "categories"
        let categories = await storeService.getCategories();
    
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
      } catch (err) {
        viewData.categoriesMessage = "no results";
      }
    
      // render the "shop" view with all of the data (viewData)
      res.render("shop", { data: viewData });
    });

    app.get('/shop/:id', async (req, res) => {

      // Declare an object to store properties for the view
      let viewData = {};
    
      try{
    
          // declare empty array to hold "item" objects
          let items = [];
    
          // if there's a "category" query, filter the returned posts by category
          if(req.query.category){
              // Obtain the published "posts" by category
              items = await storeService.getPublishedItemsByCategory(req.query.category);
          }else{
              // Obtain the published "posts"
              items = await storeService.getPublishedItems();
          }
    
          // sort the published items by postDate
          items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
    
          // store the "items" and "item" data in the viewData object (to be passed to the view)
          viewData.items = items;
    
      }catch(err){
          viewData.message = "no results";
      }
    
      try{
          // Obtain the item by "id"
          viewData.post = await storeService.getItemById(req.params.id);
      }catch(err){
          viewData.message = "no results"; 
      }
    
      try{
          // Obtain the full list of "categories"
          let categories = await storeService.getCategories();
    
          // store the "categories" data in the viewData object (to be passed to the view)
          viewData.categories = categories;
      }catch(err){
          viewData.categoriesMessage = "no results"
      }
    
      // render the "shop" view with all of the data (viewData)
      res.render("shop", {data: viewData})
    });

// Get items route -> upgraded checking length (A5)
app.get('/items', ensureLogin, (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

 // If category query parameter is provided
  if (category) {
       // Call getItemsByCategory function from store-service
      storeService.getItemsByCategory(category)
          .then(data => {
              if (data.length > 0) {
                  res.render("items", { items: data });
              } else {
                  res.render("items", { message: "no results" });
              }
          })
          .catch(err => res.render("items", { message: "no results" })); 
  }
  // If minDate query parameter is provided
  else if (minDate) {
       // Call getItemsByMinDate function from store-service
      storeService.getItemsByMinDate(minDate)
          .then(data => {
              if (data.length > 0) {
                  res.render("items", { items: data });
              } else {
                  res.render("items", { message: "no results" });
              }
          })
          .catch(err => res.render("items", { message: "no results" })); 
  }
  // If no query parameters are present, return all items
  else {
      storeService.getAllItems()
          .then(data => {
              if (data.length > 0) {
                  res.render("items", { items: data });
              } else {
                  res.render("items", { message: "no results" });
              }
          })
          .catch(err => res.render("items", { message: "no results" })); 
  }
});

// Get item route
app.get('/item/:id', ensureLogin, (req, res) => {
  const itemId = req.params.id;

  // Call getItemById function from store-service
  storeService.getItemById(itemId)
      .then((item) => {
          if (item) {
              res.json(item);
          } else {
              // If item is not found, return 404 status
              res.status(404).send('Item not found');
          }
      })
      .catch((error) => {
          console.error('no Item fetched:', error);
          res.status(500).send('Item fetching cause error');
      });
});

    // Get categories data
app.get('/categories', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then(data => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch(err => res.render("categories", { message: "no results" }));
});

    //render case error:404
    app.use((req, res, next) => {
      //res.status(404);
      res.render('404'); 
  });


  // a6 store data initialization->authData
  authData.initialize()
  .then(authData.initialize)
  .then(function(){
      app.listen(HTTP_PORT, startingProcess);
  }).catch(function(err){
      console.log("unable to start server: " + err);
  });

  function startingProcess() {
    console.log("Express http server listening on: " + HTTP_PORT);
    
    // Initialize the storeService
    return storeService.initialize()
        .then(function (data) {
            console.log(data);
        })
        .catch(function (err) {
            console.log(err);
        });
}
