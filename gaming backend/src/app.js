const express = require("express");
const routes = require("./routes");
const { AzureSasConfigError } = require("./services/azureBlob");
const { apiResponse } = require("./utils");
// const passport = require("./config/passport");                                                                                                                                                 
const cookieParser = require("cookie-parser");

const cors = require("cors");

// Reflect the request origin so cookies (credentials: true) work across
// ports. `origin: "*"` is incompatible with `credentials: true` per the
// CORS spec, so we echo back whatever Origin the browser sent.
const corsOptions = {
    origin: (origin, cb) => cb(null, origin || true),
    credentials: true,
};
const app = express();
app.use(cors(corsOptions));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

// Uploads live in Azure Blob Storage (see services/azureBlob.js). No local
// static mount is needed — clients consume the `url` field directly.

app.get("/", (req, res) => {
    res.send("Hello gamers!");
});
//routes
app.use("/api", routes);


app.use((err, req, res, next) => {
    if (err instanceof AzureSasConfigError) {
        return apiResponse.failure(res, err.message, 400);
    }
    return apiResponse.failure(res, err.message, 500, err.stack);
});
module.exports = app;