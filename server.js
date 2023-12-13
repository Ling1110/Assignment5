const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const authData = require("./modules/auth-service.js");
const clientSessions = require('client-sessions');

app.use(clientSessions( {
  cookieName: "session",
  secret: "web_a6",
  duration: 2*60*1000,
  activeDuration: 1000*60
}));

app.use((req,res,next) => {
  res.locals.session = req.session;
  next();
});

ensureLogin = (req,res,next) => {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else { next(); }
};

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/addSet", async (req, res) => {
  let themes = await legoData.getAllThemes()
  res.render("addSet", { themes: themes })
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }

});

app.get("/lego/editSet/:num", async (req, res) => {

  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }

});

app.post("/lego/editSet", async (req, res) => {

  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
})

app.get("/lego/sets", async (req, res) => {

  let sets = [];

  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets })
  } catch (err) {
    res.status(404).render("404", { message: err });
  }

});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set })
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});


//login
app.get("/login", (req,res) => {
  res.render("login");
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  
  authData.checkUser(req.body)
  .then((user) => {
    req.session.user = {
      userName: user.userName, 
      email: user.email, 
      loginHistory: user.loginHistory 
    }

    res.redirect('/lego/sets');
  })
  .catch((err) => {
    res.render('login', { errorMessage: err, userName: req.body.userName });
  });
});


app.get("/register", (req,res) => {
  res.render("register");
});


app.post('/register', async (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});


app.get("/logout", (req,res) => {
  req.session.reset();
  res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req,res) => {
  res.render("userHistory", {user:req.session.user} );
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});


legoData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log(`app listening on:  ${HTTP_PORT}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`);
});