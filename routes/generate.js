const express = require("express");
const fs      = require("fs");
const urlsDB  = require("../data/urls")
const accountDB = require("../data/account");
const router = express.Router();

// TODO: Need to add authentication middleware and displaying errors

// Shamelessly sourced from stackoverflow
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function restrictedToken(token) {
	restricted = ["", "account", "generate", "urls", "metrics", "features", "team"]
	if (token in restricted) {
		return true;
	}
	return false;
}

function addHttp(url) {
	if (url.slice(0, 7) !== "http://" && url.slice(0, 8) !== "https://") {
		new_url = "http://" + url;
		return new_url;
	}
	return url;
}

router.get(
	"/",
	async function (request, response)
	{
		const user = await accountDB.is_authenticated(request);
		console.log(user);
		if (!user) {
			return response.redirect("/account/login");
		}
		return await response.render(
			"content/generate"
		);
	}
);


router.post(
	"/",
	async function (request, response)
	{
		try {
			const user = await accountDB.is_authenticated(request);
			console.log(user);
			if (!user) {
				return response.redirect("/account/login");
			}
			const userId = user._id;
			const submitted_url = request.body['url'];
			const url = addHttp(submitted_url);
			var token = request.body['token'].replace(/[^0-9a-z]/gi, '');
			var isCustom = true;
			if (token === "") {
				token = makeid(); // added this to make it work
				while (restrictedToken(token)) {
					token = makeid();
				}
				isCustom = false;
			}

			if (isCustom && restrictedToken(token)) {
				return response.render("content/generate", {error : 'Token is already in use'});
			}
			
			var generated_url = await urlsDB.createUrl(token, url, isCustom, userId);
			if (generated_url === null) {
				if (isCustom) {
					return response.render("content/generate", {error : 'Token is already in use'});
				}
				else {
					while (generated_url === null) {
						token = makeid();
						if (!restrictedToken(token)) {
							generated_url = await urlsDB.createUrl(token, url, isCustom, userId);
						}
					}
				}
			}
			return response.redirect("/urls");
		}
		catch (error) {
			return response.render("content/generate", {error : "Something went wrong. Please try again."});
		}
	}
);

module.exports = router;