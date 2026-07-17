import dotenv from "dotenv";
dotenv.config();
import routes from "./routes/route";
import express from "express";
const app = express();
const PORT = process.env.PORT ;
import cors from "cors";
import path from "path";

const allowedOrigins = [
  "http://localhost:3000",
  "https://clipper-snowy-seven.vercel.app",
  "https://clipper-git-master-aryanrules-projects.vercel.app" , 
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

const dir = path.join(__dirname , "hello.txt");
console.log("dir" , dir);

app.use(express.json());
app.use("/api", routes);
app.get("/", (req, res) => res.send("Server is alive!"));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`) 
});
