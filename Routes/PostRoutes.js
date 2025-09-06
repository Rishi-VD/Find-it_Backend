import express from "express";
import PostItem from "../Model/PostItems.js";
import multer from "multer";

const router = express.Router();

// Use memoryStorage because Vercel Serverless Functions do not have a persistent file system.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST: Create a new post
// This route now expects the image URL to be provided in the request body after it has been uploaded to Cloudinary
router.post("/add", async (req, res) => {
    try {
        // Extract fields and the image URL from the request body
        const { name, email, phone, title, description, category, status, imageUrl } = req.body;

        // 1. Check if an item with same title + phone + category already exists
        const existingPost = await PostItem.findOne({
            title,
            phone,
            category,
        });

        if (existingPost) {
            return res.status(400).json({
                message: "This item already exists in posts.",
                existingPost,
            });
        }

        // 2. Create new post
        const newPost = new PostItem({
            name,
            email,
            phone,
            title,
            description,
            category,
            status,
            file: imageUrl, // Store the Cloudinary URL here instead of a local path
            path: imageUrl, // Use the URL for the path as well
        });

        await newPost.save();

        res.json({ message: "Post created successfully!", newPost });
    } catch (err) {
        console.error("Error while saving post:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// GET: Get all posts
router.get("/all", async (req, res) => {
    try {
        const posts = await PostItem.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Error fetching posts" });
    }
});

export default router;

