const express = require("express");
const fs      = require("fs");
const urlsDB = require("../data/urls");
const moment = require('moment');
const router = express.Router();


router.get(
	"/",
	async function (request, response)
	{

		return await response.render(
			"content/index"
		);
	}
);


router.get(
	"/features",
	async function (request, response)
	{
		return await response.render(
			"content/features"
		);
	}
)


router.get(
	"/team",
	async function (request, response)
	{
		return await response.render(
			"content/team"
		);
	}
);

router.get(
	"/:token",
	async function (request, response)
	{
		try {
			const token = request.params.token;
			const url = await urlsDB.getUrl(token);
			var referrer = request.get('Referrer');
			if (referrer === undefined) {
				referrer = "";
			}
			const timestamp = moment().format('YYYY-MM-DD HH:mm:ss Z');
			const useragnt= request.useragent;
			
			const dataAgent=await urlsDB.getDetailsFromUserAgent(useragnt);

			const addLog = await urlsDB.addViewLog(token, timestamp, referrer,dataAgent.devicetype,dataAgent.useragent);
			response.redirect(url);
		} catch(error) {
			console.log(error);
			response.redirect("/");
		}
	}
);


module.exports = router;
