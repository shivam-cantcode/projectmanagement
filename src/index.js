import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: `${__dirname}/../.env`,
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MOngo db connection error", err);
    process.exit(1);
  });
