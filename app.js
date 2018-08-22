const express            = require("express");
const path               = require("path");
const cookieparser       = require("cookie-parser");
const sass_middleware    = require("node-sass-middleware");
const express_nunjucks   = require("express-nunjucks");
const express_bulma      = require("express-bulma");
const body_parser        = require("body-parser");
const useragent = require('express-useragent');
const application = express();


application.use(
	sass_middleware(
		{
			"src":    path.join(__dirname, "assets/stylesheets"),
			"dest":   path.join(__dirname, "static/stylesheets"),
			"prefix": "/static/stylesheets",
			"debug":  true
		}
	)
);
application.use(useragent.express());

application.use(
	express_bulma("/static/stylesheets/bulma.css")
);


application.use(
	"/static",
	express.static("static")
);


application.set(
	"views",
	path.join(__dirname, "views")
);

express_nunjucks(
	application,
	{
		"noCache": true,
		"watch": true
	}
);


application.use(
	body_parser.urlencoded(
		{
			"extended": false
		}
	)
);

application.use(
	cookieparser("supersecureprivatekey")
);

application.use(
	body_parser.json()
);

application.use(
	"/account",
	require("./routes/account.js")
);

application.use(
	"/generate",
	require("./routes/generate.js")
);

application.use(
	"/urls",
	require("./routes/urls.js")
);

application.use(
	"/",
	require("./routes/root.js")
);


application.listen(
	3000,
	function ()
	{
		console.log("Express server is listening on port 3000...");
	}
);

