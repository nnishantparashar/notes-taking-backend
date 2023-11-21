const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { db } = require("./db/connect");
const authRoutes = require("./routes/auth.routes");
const noteRoutes = require("./routes/note.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

//Connect to DB
db();
app.use(express.json());
app.use(cors({origin: "*"}));
app.use(cookieParser());
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://654d15f51c9f8500a10cf848--exquisite-mousse-c75562.netlify.app"); 
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });
app.use(authRoutes);
app.use(noteRoutes);



const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("App is running on PORT :", PORT);
});
