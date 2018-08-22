const express = require("express");
const fs      = require("fs");
const urlsDB  = require("../data/urls");
const accountDB = require("../data/account");

const router = express.Router();

router.get(
	"/",
	async function (request, response)
	{
		const user = await accountDB.is_authenticated(request);
		console.log(user);
		if (!user) {
			return response.redirect("/account/login");
		}
		const userId = user._id;
		try {
			const urlData = await urlsDB.getUserUrls(userId);
			if (urlData.length == 0) {
				return response.render("content/my_urls.html", {error: "You have no URLs to display."});
			}
			return response.render("content/my_urls.html", {urls : urlData});
		}
		catch(error) {
			return response.render("content/my_urls.html", {error: "Something went wrong. Please try again."});
		}
	}
);

router.get(
	"/delete/:id",
	async function (request, response)
	{
		// auth middleware
		const user = await accountDB.is_authenticated(request);
		console.log(user);
		if (!user) {
			return response.redirect("/account/login");
		}
		const userId = user._id;
		try {
			const deletion = await urlsDB.deleteUrl(request.params.id);
			return response.redirect("/urls");
		} catch(error) {
			console.log(error);
			return response.redirect("/");
		}
	}
);

module.exports = router;