import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import PostRoutes from "./Routes/PostRoutes.js";
import ItemRoutes from "./Routes/ItemRoutes.js";

dotenv.config();
const databaseURL = process.env.DATABASE_URL;

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));


app.get("/", (req, res) => {
    res.send("<h1>Hello Rishi Kesava</h1>");
});

app.use("/api/posts", PostRoutes);
app.use("/api/items", ItemRoutes);


let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(databaseURL);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};
connectDB();

export default app;