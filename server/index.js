//Load required libraries
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const mysql2 = require('mysql2/promise');
require('dotenv').config();

//Configure port 
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

//Jwt password
const TOKEN_SECRET = process.env.TOKEN_SECRET

//SQL queries
const SQL_FIND_USER = "select googleId from veracity_users where googleId = ?";
const SQL_INSERT_USER = "insert into veracity_users values (?)";

//configure mysql pool
const pool = mysql2.createPool({

    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "paf2020",
    connectionLimit: 4,
    timezone: "+08:00",
    host: process.env.DB_HOST || "localhost"

});

//start app 
pool.getConnection().then(async conn => {

    await conn.ping();
    console.log(">>> Pinging databse...");
    app.listen(PORT, () => {
        console.log(`App started on port ${PORT} at ${new Date()}`)
    })
    conn.release()
}).catch(e => {console.log("Unable to connect to database. App not started.", e)})



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
            await conn.query(SQL_INSERT_USER, [profile.id])
            done(null, {
                //passport will generate a user object as below as req.user
                googleId: profile.id,
                loginTime: (new Date()).toString(),
                security: 2
            })
        }
        
    }
    catch(e){console.log(e)}
    finally{conn.release()}

  }
));

//Instantiate an instance of express
const app = express();

//configure express
app.use(morgan('combined'));
app.use(cors());
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
    finally{conn.release()}
    
});

//Configure routes 

//login route
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

//After the user clicks allow
app.get('/auth/google/callback', passport.authenticate('google'), (req,res) => {
    //Generate a jwt
    const issuedTimeInSeconds = (new Date().getTime()/1000)
    const token = jwt.sign({

        sub: req.user.googleId,
        iss: 'chins',
        iat: issuedTimeInSeconds,
        nbf: issuedTimeInSeconds,
        exp: issuedTimeInSeconds + (60*60)  //token expires 30s after being issued

    }, TOKEN_SECRET)

    res.status(200).type('application/json').json({"message": "User logged in", token})

});
