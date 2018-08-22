const usersRoutes = require("./users"); 

module.exports = (application) => {
    application.use("/", usersRoutes); 

    application.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};
 