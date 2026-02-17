import dotenv from "dotenv";
dotenv.config();
import routes from "./routes/route";
import express from "express";
// import { getClipFormats } from "./services/services";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api', routes);
app.get("/", (req, res) => res.send("Server is alive!"));



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`) 
});
