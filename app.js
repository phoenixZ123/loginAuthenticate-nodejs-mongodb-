import express from 'express';
import session from 'express-session';
import hbs from 'express-handlebars';
import mongoose, { mongo } from 'mongoose';
import passport from 'passport';
import { User } from './models/UserSchema.js';
import dotenv from 'dotenv';
import local from 'passport-local';
import bcrypt from 'bcrypt';
import dbConnect from './models/db.js';
const localStrategy = local.Strategy;

const app = express();
dotenv.config();
dbConnect()
//middleware
app.engine('hbs', hbs.engine({
    extname: 'hbs',


}))
app.set('view engine', 'hbs');
app.use(express.static('public'))

app.use(session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
})
passport.use(new localStrategy(function (email, password, done) {
    User.findOne({ email }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: "Incorrect email" });

        bcrypt.compare(email, password, function (err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: "Incorrect password" })
            return done(null, user);
        })
    })
}))

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
        res.redirect('/login');
    }
}

function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
        res.redirect('/login');
    }
}


//set up user

app.get('/setup', async (req, res) => {
    const exists = await User.exists({ email: "phuephue1125@gmail.com" });
    if (exists) {
        console.log("Exists");
        res.redirect('/login');
        return;
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash("password", salt, function (err, hash) {
            if (err) return next(err);
            const NewAdmin = new User({
                email: "phuephue1125@gmail.com",
                passport: hash
            });
            NewAdmin.save();
            res.redirect('/login');
        })
    })
})

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' })
})
app.get('/login', isLoggedOut, (req, res) => {
    const response = {
        title: "Login",
        error: req.query.error
    }
    res.render('login', response);
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
}))
app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
})
const port = process.env.port || 3000;
app.listen(port, (req, res) => {
    console.log(`server running on port ${port}`);
})