/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Ling Wang Student ID: 125753228 Date: Nov 27
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

app.get("/lego/addSet", async (req,res)=>{
    try{
      let themeData = await legoData.getAllThemes();
      res.render("addSet", { themes: themeData });
    }catch(err){
      res.status(404).render("404", {message: err});
    }
  });

  app.post('/lego/addSet', async (req, res) => {
    try {
      await legoSets.addSet(req.body);
      res.redirect('/lego/sets');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get('/lego/editSet/:num', async (req, res) => {
  
    try {
      const [setData, themeData] = await Promise.all([
        legoData.getSetByNum(req.params.num),
        legoData.getAllThemes(),
      ]);
  
      res.render('editSet', { themes: themeData, set: setData });
    } catch (err) {
      res.status(404).render('404', { message: err });
    }
  });
  

  app.post('/lego/editSet', async (req, res) => {
    const { set_num, name, year, theme_id } = req.body;
    try {
      await legoSets.editSet(set_num, { name, year, theme_id });
      res.redirect('/lego/sets');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get('/lego/deleteSet/:num', async (req, res) => {
    const setNum = req.params.num;
    try {
      await legoSets.deleteSet(setNum);
      res.redirect('/lego/sets');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});