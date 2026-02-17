import dotenv from "dotenv";
dotenv.config();

import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


app.get("/", (req, res) => res.send("Server is alive!"));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`) 
});
