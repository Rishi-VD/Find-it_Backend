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
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Import your custom route handlers
import PostRoutes from "./Routes/PostRoutes.js";
import ItemRoutes from "./Routes/ItemRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// ---------------- Middlewares ----------------
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// ---------------- Cloudinary + Multer Setup ----------------
// Use multer's memoryStorage to avoid saving files to a local disk,
// which is required for serverless environments.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ensure Cloudinary environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary environment variables are missing. Please check your .env file.");
    // Exit the process for local development if critical variables are missing
    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// ---------------- Upload Route ----------------
app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "lost-found" },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        res.status(500).json({ error: err.message || "Upload failed" });
    }
});

// ---------------- Fallback Route for Vercel ----------------
app.get('/', (req, res) => {
    res.send('<h1>Find-It Backend is up and running!</h1>');
});

// ---------------- Server Startup Logic ----------------

/**
 * Connects to MongoDB and starts the Express server.
 * The server will not start until the database connection is successful.
 */
async function startServer() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("❌ DATABASE_URL environment variable is missing. Cannot connect to MongoDB.");
            if (process.env.NODE_ENV !== "production") {
                process.exit(1);
            }
        } else {
            await mongoose.connect(process.env.DATABASE_URL);
            console.log("✅ Connected to MongoDB");
        }

        // Use routes only after the database connection is established
        app.use("/api/posts", PostRoutes);
        app.use("/api/items", ItemRoutes);

        // This block runs the server locally
        const port = process.env.PORT || 5001;
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });

    } catch (error) {
        console.error("❌ Fatal error during server startup:", error);
        if (process.env.NODE_ENV !== "production") {
            process.exit(1);
        }
    }
}

// Check if running in a local environment (not Vercel)
if (process.env.NODE_ENV !== "production") {
    startServer();
}

export default app;

