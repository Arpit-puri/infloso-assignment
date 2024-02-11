const mongoose = require("mongoose");
const DB = process.env.DB;

mongoose.set("strictQuery", true);

mongoose.connect(DB);

mongoose.connection.on("connected", () => console.log("connected to database"));
mongoose.connection.on("open", () => console.log("open"));
mongoose.connection.on("disconnected", () => console.log("disconnected"));
mongoose.connection.on("reconnected", () => console.log("reconnected"));
mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
mongoose.connection.on("close", () => console.log("close"));
