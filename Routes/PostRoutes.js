import express from "express";
import multer from "multer";
import PostItem from "../Model/PostItems.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads")); // ✅ correct absolute path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// POST: Create a new post
// router.post("/add", upload.single("file"), async (req, res) => {
//     try {
//         const newPost = new PostItem({
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             title: req.body.title,
//             description: req.body.description,
//             category: req.body.category,
//             status: req.body.status,
//             file: req.file.filename,  // ✅ store just the filename
//             path: req.file.path,      // ✅ absolute path if you want
//         });

//         await newPost.save();
//         res.json({ message: "Post created successfully!" });
//     } catch (err) {
//         console.error("Error while saving post:", err);
//         res.status(500).json({ error: "Server error", details: err.message });
//     }
// });
router.post("/add", upload.single("file"), async (req, res) => {
    try {
        // Extract fields
        const { name, email, phone, title, description, category, status } = req.body;

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
            file: req.file ? req.file.filename : null,
            path: req.file ? req.file.path : null,
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

// GET: Serve image by filename
router.get("/img/:id", async (req, res) => {
    try {
        const post = await PostItem.findById(req.params.id);
        if (!post || !post.file.data) {
            return res.status(404).send("Image not found");
        }
        const imgPath = path.join(__dirname, "uploads", post.file)
        res.sendFile(imgPath);
    } catch (err) {
        res.status(500).send("Error retrieving image");
    }
});

export default router;
