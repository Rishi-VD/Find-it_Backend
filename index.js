import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import PostRoutes from "./Routes/PostRoutes.js";
import ItemRoutes from "./Routes/ItemRoutes.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const port = 5001;
// app.get('/', (req, res) => {
//     res.send('<h1>Hello Rishi Kesava</h1>');
// });

app.use("/api/posts", PostRoutes);
app.use("/api/items", ItemRoutes);

// Vercel backend lo run kavali ante Serverless function(ante backend continous ga run avuthundhi) rayali
let isConnected = false;
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// add middleware
app.use((req, res, next) => {
    if (!isConnected) {
        connectToMongoDB();
    }
    next();
});


// app.listen(port, () => {
//     console.log(`Server is running at ${port}`);
// })

// mongoose.connect(process.env.DATABASE_URL).then(() => {
//     console.log('Connected to MongoDB');
// }).catch((err) => {
//     console.log(err);
// });

// do not use app.listen() in  vercel and add "vercel-start":"node index.js" in package.json
module.exports = app;
