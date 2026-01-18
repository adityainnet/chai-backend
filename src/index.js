import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo db connection failed", err);
  });
