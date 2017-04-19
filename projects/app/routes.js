var mongoose = require('./models/project');
module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res, next) {
        //retrieve all blobs from Monogo
        mongoose.model('Project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                projects.forEach(function(project, index, arr) {
                   var arr = project.clanovi.toString().split(",");
                   projects.clanoviSplited = arr;
                   //console.log(projects.clanoviSplited);
                })
                //console.log(projects);
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
                    html: function(){
                        res.render('profile.ejs', {
                              "projects" : projects,
                              user : req.user
                          });
                    },
                    //JSON response will show all blobs in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
        });
        
    });
   //get view for add project
    app.get('/profile/add', isLoggedIn, function(req, res, next) {


            mongoose.model('User').find({}, function (err, users) {
              if (err) {
                  return console.error(err);
              } else {
                //console.log(projects);
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
                    html: function(){
                        res.render('addproject.ejs', {
                              "users" : users,
                              user : req.user
                          });
                    },
                    //JSON response will show all blobs in JSON format
                    json: function(){
                        res.json(users);
                    }
                });
              }     
        });
    });

    // post project
    app.post('/profile/addproject', isLoggedIn, function(req, res) {
        var naziv = req.body.naziv;
        var opis = req.body.opis;
        var cijena = req.body.cijena;
        var obavljeni = req.body.obavljeni;
        var pocetak = req.body.pocetak;
        var zavrsetak = req.body.zavrsetak;
        var voditelj = req.user.local.email;
        var clanovi = req.body.clanovi;

        mongoose.model('Project').create({
            naziv : naziv,
            opis : opis,
            cijena : cijena,
            obavljeni : obavljeni,
            pocetak : pocetak,
            zavrsetak : zavrsetak,
            voditelj : voditelj,
            clanovi : clanovi
        },
        function (err, project) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Blob has been created
                  console.log('POST creating new project: ' + project);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("profile");
                        // And forward to success page
                        res.redirect("/profile");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(project);
                    }
                });
              }
          })
    });


    app.param('id', function(req, res, next, id) {
        //console.log('validating ' + id + ' exists');
        //find the ID in the Database
        mongoose.model('Project').findById(id, function (err, blob) {
            //if it isn't found, we are going to repond with 404
            if (err) {
                console.log(id + ' was not found');
                res.status(404)
                var err = new Error('Not Found');
                err.status = 404;
                res.format({
                    html: function(){
                        next(err);
                     },
                    json: function(){
                           res.json({message : err.status  + ' ' + err});
                     }
                });
            //if it is found we continue on
            } else {
                //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
                //console.log(blob);
                // once validation is done save the new item in the req
                req.id = id;
                // go to the next thing
                next(); 
            } 
            });
    });



app.get('/:id/edit',  isLoggedIn, function(req, res, next) {
      //GET the individual blob by Mongo ID
          //search for the blob within Mongo
          mongoose.model('Project').findById(req.id, function (err, project) {
              if (err) {
                  console.log('GET Error: There was a problem retrieving: ' + err);
              } else {
                  //Return the blob
                  console.log('GET Retrieving ID: ' + project._id);
                  var project = project;
                  res.format({
                      //HTML response will render the 'edit.jade' template
                      html: function(){
                             res.render('projects/edit', {
                                "project" : project
                            });
                       },
                       //JSON response will return the JSON output
                      json: function(){
                             res.json(project);
                       }
                  });
              }
          });
      });
      //PUT to update a blob by ID
app.put('/:id/edit/put',  isLoggedIn, function(req, res, next) {
          // Get our REST or form values. These rely on the "name" attributes
      var naziv = req.body.naziv;
    var opis = req.body.opis;
    var cijena = req.body.cijena;
    var obavljeni = req.body.obavljeni;
    var pocetak = req.body.pocetak;
    var zavrsetak = req.body.zavrsetak;
    var voditelj = req.user.local.email;
    var clanovi = req.body.clanovi;

    mongoose.model('Project').create({
        naziv : naziv,
        opis : opis,
        cijena : cijena,
        obavljeni : obavljeni,
        pocetak : pocetak,
        zavrsetak : zavrsetak,
        voditelj : voditelj,
        clanovi : clanovi
    }, function (err, project) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } 
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/profile");
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
             }
          })
      });
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
