import express from "express";
import PostItem from "../Model/PostItems.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { name, email, phone, title, description, category, status, file, path } = req.body;

        if (!file || !file.startsWith("data:image")) {
            return res.status(400).json({ error: "Invalid or missing base64 image" });
        }

        const existingPost = await PostItem.findOne({ title, phone, category });
        if (existingPost) {
            return res.status(400).json({
                message: "This item already exists in posts.",
                existingPost,
            });
        }

        const newPost = new PostItem({
            name,
            email,
            phone,
            title,
            description,
            category,
            status,
            file,
            path,
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error saving post:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

router.get("/all", async (req, res) => {
    try {
        const posts = await PostItem.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Error fetching posts" });
    }
});

router.get("/img/:id", async (req, res) => {
    try {
        const post = await PostItem.findById(req.params.id);
        if (!post || !post.file) {
            return res.status(404).send("Image not found");
        }

        res.json({ image: post.file });
    } catch (err) {
        res.status(500).send("Error retrieving image");
    }
});

export default router;
