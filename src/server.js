import { app } from "./app.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
