const { sequelize } = require("./models");
// sequelize.sync({ force: true });
// sequelize.sync({ alter: true });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const authenticateMiddleware = require("./middlewares/authenticate");

const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const postRoute = require("./routes/createPost-route");
const tagRoute = require("./routes/tag-route");
const followRoute = require("./routes/follow-route");

const app = express();

app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 1000,
    message: { message: "to many requests, please try again later" }
  })
);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/tag", tagRoute);
app.use("/follow", authenticateMiddleware, followRoute);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(chalk.yellowBright.italic.bold`server runnig on port: ${port}`);
});
