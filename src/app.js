import "dotenv/config";
import express from "express";
import morgan from "morgan";
import connectDB from "./config/db.js";
import router from "./routes/indexRoute.js";

const app = express();

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", router);

const port = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
});
