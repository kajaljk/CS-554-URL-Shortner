let uuid   = require("uuid");
let bcrypt = require("bcrypt");
const mongoCollections = require("../config/mongoCollections");
const uuidv1 = require("uuid/v1");

const saltRounds = 10;

const users = mongoCollections.users;

const cookie_key = "AuthCookie";


async function register(information)
{
	if (information === null)
	{
		throw new ReferenceError(
			"Failed to provide account information."
		);
	}

	return;
}


async function authenticate(request, response)
{
	let email = request.body.email;
	let password = request.body.password;

	let user = await fetch_user(email);

	if (user === null)
	{
		return false;
	}

	let password_hash = await bcrypt.compare(password, user.hashedPassword);

	if (password_hash === true)
	{
		const sessionId = uuidv1();
		const updateInfo = await this.storeSession(sessionId, user.hashedPassword)

		return sessionId;
	}

	return false;
}

async function storeSession(sessionId, hashedPassword) {

	const userCollection = await users();
	const updateSession = await userCollection.updateOne({hashedPassword: hashedPassword}, {$set: {sessionId: sessionId}});
	return
}

async function fetch_user(email)
{
	const userCollection = await users();
	const newUser = await userCollection.findOne({'email':email});
	if(newUser === null){
		return null;
	}
	return newUser; 
}


async function is_authenticated(request)
{
	if (request.cookies.AuthCookie)
	{
		const userCollection = await users();
		const user = await userCollection.findOne({sessionId: request.cookies.AuthCookie});
		if (user === null) {
			return false;
		}
		return user;
	}

	return false;
}

async function createUser(email,password){
	const existUser=await this.getUserByEmail(email);
	if(existUser === null){
		let newUser={
			_id : uuidv1(),
			sessionId :"",
			hashedPassword: bcrypt.hashSync(password, saltRounds),
			passwordResetToken:'',
			passwordResetExpires:'',
			email: email
		}
		const userCollection = await users();

		const insertUser= await userCollection.insertOne(newUser);
		if(insertUser.insertedCount === 0){
			throw "Could not add user.";
		} 
		return newUser;
	}
	else{
		throw `User with ${email} exists. Try with another email. `;
	}
}

async function getUserByEmail(email){
	if(!email || typeof email != "string"){
		throw "You must provide email to search for user.";
	}
	const userCollection = await users();
	const newUser = await userCollection.findOne({'email':email});
	if(newUser === null){
		return null;
	}
	return newUser;
}

async function updatePasswordToken(email,passwordToken,passwordExpire){
	if(!email || typeof email != "string"){
		throw "You must provide email to search for user.";
	}
	const userCollection = await users(); 
	let newUser={};
	newUser.passwordResetToken=passwordToken;
	newUser.passwordResetExpires=passwordExpire;

	let updateCommand={
		$set: newUser
	};
	
	const updateResponse = userCollection.updateOne({'email' : email}, updateCommand);
	if (updateResponse.modifiedCount === 0) throw "Could not update rest password token";

	return await this.getUserByEmail(email);
}

async function updatePassword(email,newPassword){
	if(!email || typeof email != "string"){
		throw "You must provide email to search for user.";
	}
	const userCollection = await users(); 
	let newUser={};
	newUser.hashedPassword =bcrypt.hashSync(newPassword, saltRounds);
	newUser.passwordResetToken=undefined;
	newUser.passwordResetExpires=undefined;

	let updateCommand={
		$set: newUser
	};
	
	const updateResponse = userCollection.updateOne({'email' : email}, updateCommand);
	if (updateResponse.modifiedCount === 0) throw "Could not update user password";

	return await this.getUserByEmail(email);
}

async function getUserByPasswordToken(token){
	if(!token || typeof token != "string"){
		throw "You must provide token to search for user.";
	}
	const userCollection = await users();
	const newUser = await userCollection.findOne({passwordResetToken:token,passwordResetExpires:{$gt:Date.now()}});
	if(newUser === null){
		return false;
	}
	return newUser;
}

async function unsetSession(sessionId) {

	const userCollection = await users();
	const updateSession = await userCollection.updateOne({sessionId: sessionId}, {$set: {sessionId: ''}});
	return
}

module.exports.is_authenticated = is_authenticated;
module.exports.storeSession 	= storeSession;
module.exports.unsetSession		= unsetSession;
module.exports.authenticate     = authenticate;
module.exports.fetch_user       = fetch_user;
module.exports.createUser       = createUser;
module.exports.getUserByEmail   = getUserByEmail;
module.exports.updatePassword   = updatePassword;
module.exports.updatePasswordToken    = updatePasswordToken;
module.exports.getUserByPasswordToken = getUserByPasswordToken;
