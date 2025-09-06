// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";
// import cookieParser from "cookie-parser";
// import PostRoutes from "./Routes/PostRoutes.js";
// import ItemRoutes from "./Routes/ItemRoutes.js";


// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(cookieParser());
// app.use(express.json());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const port = 5001;
// app.get('/', (req, res) => {
//     res.send('<h1>Hello Rishi Kesava</h1>');
// });

// app.use("/api/posts", PostRoutes);
// app.use("/api/items", ItemRoutes);

// // Vercel backend lo run kavali ante Serverless function(ante backend continous ga run avuthundhi) rayali
// // let isConnected = false;
// // async function connectToMongoDB() {
// //     try {
// //         await mongoose.connect(process.env.DATABASE_URL, {
// //             useNewUrlParser: true,
// //             useUnifiedTopology: true
// //         });
// //         isConnected = true;
// //         console.log('Connected to MongoDB');
// //     } catch (error) {
// //         console.error('Error connecting to MongoDB:', error);
// //     }
// // }

// // // add middleware
// // app.use((req, res, next) => {
// //     if (!isConnected) {
// //         connectToMongoDB();
// //     }
// //     next();
// // });


// app.listen(port, () => {
//     console.log(`Server is running at ${port}`);
// })

// mongoose.connect(process.env.DATABASE_URL).then(() => {
//     console.log('Connected to MongoDB');
// }).catch((err) => {
//     console.log(err);
// });

// // do not use app.listen() in  vercel and add "vercel-start":"node index.js" in package.json
// export default app;



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import PostRoutes from "../Routes/PostRoutes.js";
import ItemRoutes from "../Routes/ItemRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

dotenv.config();

const app = express();

// Set up Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Vercel backend lo run kavali ante Serverless function rayali
// This approach ensures a connection is established before a request is handled.
async function connectToMongoDB() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.DATABASE_URL);
            console.log('✅ Connected to MongoDB');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection is ready for each request
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        await connectToMongoDB();
    }
    next();
});

// API route to handle file uploads directly to Cloudinary
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI);

        // Return the secure URL from Cloudinary
        res.json({
            message: "File uploaded successfully!",
            url: result.secure_url,
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ error: "Cloudinary upload failed", details: error.message });
    }
});

// API Routes
app.use("/api/posts", PostRoutes);
app.use("/api/items", ItemRoutes);

// Export the Express app for Vercel
export default app;


