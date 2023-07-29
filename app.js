const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const fileUpload = require("express-fileupload");
const mongoConnect = require("./Config/db");
const userRoutes = require("./Router/userRouter");
const path = require("path");
const { initializeSocket } = require("./Socket/socket");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
const port = process.env.PORT || 5000;

const whitelist = ["http://localhost:3001"];
app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(
  cors({
    origin: "https://latestwhatsapp.netlify.app",
    // origin:"http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use("/api/v1/user", userRoutes);

const server = app.listen(port, () => {
  console.log("Your Server listening on port:", 5000);
});
initializeSocket(server);

mongoConnect();

module.exports = { app };
