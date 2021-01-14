//Load required libraries
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const mysql2 = require('mysql2/promise');
require('dotenv').config();
const fetch = require('node-fetch');
const { MongoClient, Timestamp } = require('mongodb');
const fs = require('fs')

//Configure port 
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

//Configure Mongodb
const mongoPassword = process.env.MONGO_DB_PASSWORD
const MONGO_DB = 'veracity';
const MONGO_COL = 'analyses';
const MONGO_URL = `mongodb+srv://veracity_admin:${mongoPassword}@veracity-app-cluster.15dnu.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

//Jwt password
const TOKEN_SECRET = process.env.TOKEN_SECRET

//SQL queries
const SQL_FIND_USER = "select googleId from veracity_users where googleId = ?";
const SQL_INSERT_USER = "insert into veracity_users values (?, ?)";
const SQL_INSERT_ARTICLE = "insert into articles (url, title, content, googleId, timestamp) values (?,?,?,?,?)";
const SQL_GET_ARTICLES_BY_GOOGLEID = "select * from articles where googleId = ?";
const SQL_DELETE_ARTICLE_BY_ID = "delete from articles where id = ?"; 

//configure mysql pool
const pool = mysql2.createPool({

    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "paf2020",
    connectionLimit: 100,
    timezone: "+08:00",
    host: process.env.DB_HOST || "localhost"

});

//start app
const p0 = pool.getConnection();
const p1 = mongoClient.connect();

Promise.all([p0,p1]).then(async result => {

    const conn = result[0];
    await conn.ping();
    console.log(">>> Pinging databse...");
    app.listen(PORT, () => {
        console.log(`App started on port ${PORT} at ${new Date()}`)
    })
    conn.release()

}).catch(e => {console.log("Unable to connect to databases. App not started.", e)})



//Configure passport with strategy 
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  async (request, accessToken, refreshToken, profile, done) => {
    //perform authentication
    console.log(`Profile: `, profile)
    const conn = await pool.getConnection();
    try{
        const [authResult,_] = await conn.query(SQL_FIND_USER, [profile.id])
        //if auth is correct, authResult.length == 1, then !!authResult.length == true
        if (!!authResult.length) {
            done(null, {   
                //passport will generate a user object as below as req.user
                googleId: profile.id,
                loginTime: (new Date()).toString(),
                security: 2
            })
     
        }else{
            //create a new user in the mysql database with the corresponding google_id
            await conn.query(SQL_INSERT_USER, [profile.id, profile.email])
            done(null, {
                //passport will generate a user object as below as req.user
                googleId: profile.id,
                loginTime: (new Date()).toString(),
                security: 2
            })
        }
        
    }
    catch(e){console.log(e)}
    finally{ await conn.release()}

  }
));

//Instantiate an instance of express
const app = express();

//configure express
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Initialise passport after app.use json and url.encoded
app.use(passport.initialize())
app.use(passport.session())
//Serialise users
passport.serializeUser((user, done) => {
    done(null, user.googleId);
  });

passport.deserializeUser(async (id, done) => {
    const conn = await pool.getConnection();
    try{
        const [user,_] = await conn.query(SQL_FIND_USER, [id]);
        console.log(user)
        done(null,user)
    }
    catch(e){
        console.log(e)
    }
    finally{ await conn.release()}
    
});

//Check token middleware
const checkToken = (req, res, next) => {

    //check if request has authorization header
    const token = req.get('Authorization');
    if (null == token) {
        res.status(403).json({"message": "Missing Authorization header"})
    }
    try{
        //verify token
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.googleId = verified.sub;
        //console.info(`Verified token: `, verified);
        next();
    } catch(e) {
        res.status(403).json({message: 'Incorrect token', e})
    }

}

//Configure routes 

//login route
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
  )
);

//After the user clicks allow
app.get('/auth/google/callback', passport.authenticate('google'), (req,res) => {
    //Generate a jwt
    const issuedTimeInSeconds = (new Date().getTime()/1000)
    const token = jwt.sign({

        sub: req.user.googleId,
        iss: 'chins',
        iat: issuedTimeInSeconds,
        nbf: issuedTimeInSeconds,
        exp: issuedTimeInSeconds + (60*60)  //token expires 1 hour: 60 x 60s (60*60) after being issued

    }, TOKEN_SECRET)
    let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
    responseHTML = responseHTML.replace('%value%', JSON.stringify({
        user: req.user,
        token
    }))
    res.status(200).send(responseHTML);
    //res.status(200).type('application/json').json({"message": "User logged in", token})

});

app.get('/main', (req, res) => {

    res.status(200).type('application/json').json({"page": "main page"})

})

//Analyze article + store analysis in MongoDb
app.post('/api/analyze', (req,res,next) => {checkToken(req,res,next)}, async (req, res) => {

    const article = req.body;
    console.log(article)
    const conn = await pool.getConnection();
    //post to fakebox end point and upload results to mongo
    try{
        await conn.beginTransaction()
        //Insert article into MySql
        const timestamp = new Date();
        const [sqlReturn, _] = await conn.query(SQL_INSERT_ARTICLE, [article.url, article.title, article.content, req.googleId, timestamp])
        //Perform Analysis
        const result = await fetch('http://chinsfakebox.eastus.azurecontainer.io:8080/fakebox/check', {method: 'post', body: JSON.stringify(article), headers: { 'Content-Type': 'application/json' }})
        const resultJson = await result.json()
        //Insert analysis results into MongoDb
        await mongoClient.db(MONGO_DB).collection(MONGO_COL).insertOne({
            _id: sqlReturn.insertId,
            analysis: resultJson,
        })
        await conn.commit();
        res.status(200).json(resultJson);

    } catch(e){
        conn.rollback()
        res.status(500).type('application/json').json({e})
    } finally{ await conn.release() }
    
}

)

//Get search history route
app.get('/api/history', (req,res,next) => {checkToken(req,res,next)}, async (req, res) => {

    // mongoClient.db(MONGO_DB).collection(MONGO_COL)
    //     .find({user: req.googleId}).toArray()
    //     .then(result => {res.status(200).type('application/json').json(result)})
    //     .catch(err => {res.status(500).type('application/json').json(err)})
    
    //Get articles from MySql
    const conn = await pool.getConnection();
    try{
        const [articles,_] = await conn.query(SQL_GET_ARTICLES_BY_GOOGLEID, [req.googleId]);
        res.status(200).type('application/json').json(articles)

    } catch(err) {
        res.status(500).type('application/json').json({err, "message": "unable to retrieve articles from MySql db"})
    }
}

)

//Get article analysis by id
app.get('/api/history/:id', (req,res,next) => {checkToken(req,res,next)}, async (req, res) => {

    const id = parseInt(req.params.id);
    try{

        const analysisResult = await mongoClient.db(MONGO_DB).collection(MONGO_COL).findOne({_id: id});
        res.status(200).type('application/json').json(analysisResult)

    } catch(err){
        res.status(500).type('application/json').json({err, "message": "unable to retrieve articles from MongoDb"})
    }

 } )

 app.delete('/api/history/:id', (req,res,next) => {checkToken(req,res,next)}, async (req, res) => {

    const id = parseInt(req.params.id); 
    const conn = await pool.getConnection();
    //Delete article from MySQL and analysis from MongoDB
    try{
        await conn.beginTransaction();
        await conn.query(SQL_DELETE_ARTICLE_BY_ID, [id]);
        await mongoClient.db(MONGO_DB).collection(MONGO_COL).deleteOne({_id: id})
        await conn.commit()
        res.status(200).json({message: `Article and analysis id ${id} deleted.`});

    } catch(e){
        conn.rollback()
        res.status(500).type('application/json').json({e})
    } finally{ await conn.release() }
    
 })
