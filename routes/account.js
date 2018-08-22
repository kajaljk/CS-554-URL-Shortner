const express = require("express");
const fs      = require("fs");
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const async = require('async');
const crypto = require('crypto');
const secrets = require('../config/secret');
const account = require("../data/account");
const router = express.Router();


router.get(
	"/",
	async function (request, response)
	{
		return await response.render(
			"content/account/index",
		);
	}
);


router.get(
	"/register",
	async function (request, response)
	{
		return await response.render(
			"content/account/register",
		);
	}
);


router.post(
	"/register",
	async function (request, response)
	{
		try {
			let userBody=request.body; 
            let newUser = await account.createUser(userBody.email, userBody.password);
            if(newUser){
                return response.redirect('/account/login');
			}
			return response.render('content/account/register',{"message":"Error during register."});
        } catch (error) { 
            response.render('content/account/register',{"message":error});
        }     
	}
);


router.get(
	"/login",
	async function (request, response)
	{
		return await response.render(
			"content/account/login",
		);
	}
);

router.post(
	"/login",
	async function (request, response)
	{
		const sessionId = await account.authenticate(request, response);
		if (sessionId)
		{
			return response.cookie("AuthCookie", sessionId).redirect("/");
		}

		return response.render(
			"content/account/login",
			{
				"message": "Failed to authenticate!"
			}
		);
	}
);

router.get(
	'/forgetPassword',
    async function (request, response)
	{
		return await response.render(
			"content/account/forgetPassword",
		);
	}
);

router.post(
	"/forgetPassword", (req,res,next) =>{
    async.waterfall([
        function(callback){
            crypto.randomBytes(20,(err,buf)=> {
                var rand = buf.toString('hex');
                callback(err,rand);
            });
        },
        function(rand, callback){
            account.getUserByEmail(req.body.email).then((user)=>{
                if(!user){
                    return res.render('content/account/forgetPassword',{"message": `${req.body.email} is not registered with our site.`});
                }
                account.updatePasswordToken(req.body.email,rand,Date.now()+(60*60*1000)).then((user,err)=>{
                    callback(err,rand,user)
                });
            }).catch((err)=>{
                res.render('content/account/forgetPassword',{"message" : err});
            })
        },
        function(rand,user,callback){
            //send email to the user
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user : secrets.auth.user,
                    pass : secrets.auth.pass
                }
            });

            let mailOptions = {
                to: req.body.email,
                from: 'Url Shortener '+'<'+secrets.auth.user+'>',
                subject: 'Url Shortener - Password Reset Token',
                text :'You have requested for password reset token. \n\n'+
                        'Please click on this link to complete the process: \n\n'+
                        'http://localhost:3000/account/resetPassword/'+rand+'\n\n'
            };
			smtpTransport.sendMail(mailOptions,(err,response)=>{
				return callback(err,user);
			});
        }
    ],(err)=>{
        if(err){
            return next(err);
        }
		return res.render('content/account/forgetPassword',{"message": `Email to reset password has been sent to ${req.body.email}.`});
    })
}); 

router.get(
	'/resetPassword',
	async function (request, response)
	{
		return await response.render(
			"content/account/resetPassword",
		);
	}
);


router.get(
	'/resetPassword/:token',
	async (req,res)=>{  
		account.getUserByPasswordToken(req.params.token).then((user)=>{
			if(!user){
				return res.render('content/account/resetPassword');
			}
			res.render('content/account/resetPassword');
		})
	}
);

router.post( 
	'/resetPassword/:token',
	(req,res) =>{
		async.waterfall([
			function(callback){
				account.getUserByPasswordToken(req.params.token).then((user)=>{
					if(!user){
						//return res.redirect('/forgetPassword?msg=tokenexpire');
						return res.render('content/account/resetPassword',{"message":"Reset password token has expired."});
					}
					//save new user password in database
					account.updatePassword(user.email,req.body.password).then((user,err)=>{
						callback(err,user)
					});

				}).catch((err)=>{
					res.render('content/account/resetPassword',{"message" : err});
				})
			},
			function(user,callback){
				//send email to user informing that password is reset successfully
				
				let smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user : secrets.auth.user,
						pass : secrets.auth.pass
					}
				});

				let mailOptions = {
					to: user.email,
					from: 'Url Shortener '+'<'+secrets.auth.user+'>',
					subject: 'Url Shortener - Your password has been updated',
					text :'This is a confirmation that you have updated your password'
				};
				smtpTransport.sendMail(mailOptions,(err,response)=>{
					callback(err,user);

					return res.render('content/account/resetPassword',{"message":"Your password has been reset."});
				});
			}
		])
	}
);


router.get(
	"/logout",
	async function (request, response)
	{
		return await response.clearCookie("AuthCookie").redirect("/account/login");
	}
);


module.exports = router;

