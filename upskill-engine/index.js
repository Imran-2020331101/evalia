const app = require("./src/app");
const logger = require("./src/config/logger");

const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
  logger.info(`Upskill Engine server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});
 