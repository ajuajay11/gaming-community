const express = require("express");
const routes = require("./routes");
const { apiResponse } = require("./utils");
// const passport = require("./config/passport");                                                                                                                                                 
const cookieParser = require("cookie-parser");

const cors = require("cors");
const corsOptions = { origin: "*", credentials: true };
const app = express();
app.use(cors(corsOptions));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello gamers!");
});
console.log("Routes loaded", routes);
//routes
app.use("/api", routes);


app.use((err, req, res, next) => {
    return apiResponse.failure(res, err.message, 500, err.stack);
});
module.exports = app;