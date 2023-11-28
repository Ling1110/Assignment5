/*const setData = require("../data/setData");
const themeData = require("../data/themeData");*/
require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize('neondb', 'Ling1110', 'OiYHhUT7ZtW4', {
  host: 'ep-proud-leaf-06318617-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

const Theme = sequelize.define(
  'Theme', 
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, 
      autoIncrement: true, 
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  } 
  );

  const Set = sequelize.define(
    'Set', 
    { 
      set_num:{
        type:Sequelize.STRING,
        primaryKey: true,
      },
      name:Sequelize.STRING,
      year:Sequelize.INTEGER,
      num_parts:Sequelize.INTEGER,
      theme_id:Sequelize.INTEGER,
      img_url:Sequelize.STRING,
    });

    Set.belongsTo(Theme, {foreignKey: 'id'})



//let sets = [];

function initialize(){
  return new Promise((resolve, reject) => {
    sequelize
    .sync()
    .then(() => {
        resolve("Database sync successfully");
    })
    .catch(() => {
        reject("unable to sync the database");
    });
    });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({include: [Theme]})
    .then((data) => {
      resolve(data);
  })
  .catch(() => {
      reject("no results returned");
    });
  });
}

function getSetByNum(setNum) {

  return new Promise((resolve, reject) => {
    Set.findAll({include:[Theme],where: { set_num: setNum } })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("Unable to find requested set");
            });
    });

}

function getSetsByTheme(theme) {

  return new Promise((resolve, reject) => {
    Set.findAll({include:[Theme], where: { 
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }}})
      .then((data) => {
        resolve(data);
    })
    .catch(() => {
        reject("Unable to find requested sets");
      });  
  });
};

function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.create(setData);
      resolve();
    } catch (err) {
      reject(`Error creating set: ${err.errors[0].message}`);
    }
  });
};


function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      const themes = await Theme.findAll();
      resolve(themes);
    } catch (err) {
      reject(`Error fetching themes: ${err.message}`);
    }
  });
}

function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Set.update(setData, { where: { set_num } });
      if (result[0] > 0) {
        resolve(); 
      } else {
        reject(new Error(`No set found with set_num: ${set_num}`));
      }
    } catch (err) {
      reject(new Error(err.errors[0].message));
    }
  });
};
function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Set.destroy({ where: { set_num } });
      if (result > 0) {
        resolve(); 
      } else {
        reject(new Error(`No set found with set_num: ${set_num}`));
      }
    } catch (err) {
      reject(new Error(err.errors[0].message));
    }
  });
};

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme,addSet,getAllThemes,editSet,deleteSet }

/*sequelize
  .sync()
  .then( async () => {
    try{
      await Theme.bulkCreate(themeData);
      await Set.bulkCreate(setData); 
      console.log("-----");
      console.log("data inserted successfully");
    }catch(err){
      console.log("-----");
      console.log(err.message);

      // NOTE: If you receive the error:

      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
    }

    process.exit();
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });*/