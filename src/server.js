import { app } from "./app.js";
import * as dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
