const dotenv = require("dotenv");

dotenv.config();

const app = require("./src/app");

const PORT = process.env.APP_SERVER_PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
