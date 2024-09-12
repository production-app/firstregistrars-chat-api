require("dotenv").config();
const expresss = require("express");
const helmet = require("helmet");
const { sequelize, initModels } = require("./models");
const cookieParser = require("cookie-parser");
const shareholder = require("./routes/shareholder");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = expresss();
const PORT = process.env.PORT || 4000;

app.use(expresss.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Intialized the API routes

app.use("/v1/", shareholder);

try {
  app.listen(PORT, async () => {
    await sequelize.authenticate();
    console.log("DB connected", PORT);
  });
} catch (error) {
  console.log("Error", error);
}
