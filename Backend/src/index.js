import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";



const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
console.log({PORT});

app.listen(PORT, () => {
    console.log(`The server is listening at port ${PORT}`)
    connectDB()
})

// https://www.youtube.com/watch?v=o3IqOrXtxm8&ab_channel=AsaProgrammer