var express = require("express");
const app = express();

require("dotenv").config();

const limiter = require("./rateLimiter/rateLimiter.js"); //Added rate limiting to protect against brute force attacks.
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./Routes/routes.js");
const helmet = require("helmet"); //secure header http
const bodyParser = require("body-parser");
const mongosanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

/**Data sanitization against NOSQL query injection */
app.use(mongosanitize());

/**Data sanitization against xss attack */
app.use(xss());

/**secure header http */
app.use(helmet());

/**Database */
require("./DB/connection.js");

/*middleware*/
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet.xssFilter());
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors());

/**API routes */
app.use("/", router);

/**Starting Server */
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server connected to http://localhost:${port}`);
});
