const mongoCollections = require("../config/mongoCollections");
const urls = mongoCollections.urls;
const uuidv1 = require("uuid/v1");

module.exports = {

	async checkTokenExists(token, collection) {
		if (arguments.length !== 2) {
			throw "checkTokenExists: expected 2 argument, received " + arguments.length;
		}

		const findToken = await collection.findOne({token : token});
		if (findToken == null) {
			return false;
		}
		else {
			return true;
		}
	},

	async createUrl(token, url, isCustom, userId) {
		if (arguments.length !== 4) {
			throw "createUrl: expected 4 arguments, received " + arguments.length;
		}

		if (typeof token !== "string" || typeof isCustom !== "boolean" || typeof userId !== "string") {
			throw "createUrl: arguments must be strings";
		}

		const urlCollection = await urls();
		const tokenExists = await this.checkTokenExists(token, urlCollection);
		if (tokenExists) {
			return null;
		}

		const newUrl = {
			_id: uuidv1(),
			token: token,
			url: url,
			isCustom: isCustom,
			userId: userId,
			viewLog: []
		};

		const insertResponse = await urlCollection.insertOne(newUrl);
		if (insertResponse.insertedCount === 0) throw "Error: Could not add URL";

		return newUrl;
	},

	async getUserUrls(userId) {
		if (arguments.length !== 1) {
			throw "getUserUrls: expected 1 argument, received " + arguments.length;
		}

		if (typeof userId !== "string") {
			throw "getUserUrls: argument must be a string";
		}

		const urlCollection = await urls();
		const userUrls = await urlCollection.find({userId : userId}).toArray();
		return userUrls;
	},

	async getUrl(token) {
		if (arguments.length !== 1) {
			throw "getUrl: expected 1 argument, received " + arguments.length;
		}

		if (typeof token !== "string") {
			throw "getUrl: argument must be a string";
		}

		const urlCollection = await urls();
		const url = await urlCollection.findOne({token : token});
		if (url == null) throw "There is no URL associated with the given token: " + token;

		return url.url;
	},

	async deleteUrl(id) {
		if (arguments.length !== 1) {
			throw "deleteUrl: expected 1 argument, received " + arguments.length;
		}

		if (typeof id !== "string") {
			throw "deleteUrl: argument must be a string";
		}

		const urlCollection = await urls();
		const deletionResponse = await urlCollection.removeOne({_id : id});
		if (deletionResponse.deletedCount === 0) throw "Could not delete recipe";

		return;
	},

	async addViewLog(token, timestamp, referrer, devicetype, useragent) {
		if (arguments.length !== 5) {
			throw "addViewLog: expected 5 arguments, received " + arguments.length;
		}

		if (typeof token !== "string" || typeof timestamp !== "string" || typeof referrer !== "string"
		    || typeof devicetype !== "string" || typeof useragent !== "string") {
			throw "addViewLog: arguments must be strings";
		}

		const newLog = {
			_id: uuidv1(),
			timestamp: timestamp,
			referrer: referrer,
			devicetype: devicetype,
			useragent: useragent
		}
		const urlCollection = await urls();
		const updateResponse = urlCollection.updateOne({token : token}, {$push: {viewLog: newLog}});
		if (updateResponse.modifiedCount === 0) throw "Could not update view log";

		return await this.getUrl(token);
	},

	async getViewLogs(token) {
		urlInfo = await this.getUrl(token);
		return urlInfo.viewLog;
	},

	async getDetailsFromUserAgent(useragnt){
		let devicetype="";
		let useragent="";
		if(useragnt.isDesktop){
			devicetype = "Desktop";
		}
		else if(useragnt.isMobile){ devicetype = "Phone";}
		else if(useragnt.isBot){ devicetype = "Bot";}

		if(useragnt.browser != "" || useragnt.browser != undefined){
			useragent =`Browser(${useragnt.browser}) `; 
		}
		if(useragnt.version != "" || useragnt.version != undefined){
			useragent += `Version(${useragnt.version}) `;
		}
		if(useragnt.os != "" || useragnt.os != undefined){
			useragent += `Operating System(${useragnt.os})`;
		}
		let dataresult={
			devicetype : devicetype,
			useragent:useragent
		};
		return dataresult;
	}

}