
const passport 			 = require('passport');
const LocalStrategy		 = require('passport-local').Strategy;
const bcrypt             = require('bcrypt');
const User               = require('../data/users');

passport.serializeUser((user,done)=>{
    done(null,user._id);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id).then((user)=>{
        done(null,user);
    }).catch((err)=>{
        console.log(err);
        return done("There is error");
    }); 
}); 
passport.use('local.login',new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
    },(req,email,password,done)=> {
        User.getUserByEmail(email).then((user)=>{   
            if(user != false){
                bcrypt.compare(password, user.hashedPassword, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    if (res === true) {
                        return done(null, user,'Login successfully');
                    }
                    else if (res === false) { 
                        return done(null,false,'Password is invalid.');
                    }
                });
            }
            else{
                return done(null,false,"Email or Password is invalid.");
            }
        });
}));

