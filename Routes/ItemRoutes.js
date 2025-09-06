import express from "express";
import Item from "../Model/Item.js";
import PostItems from "../Model/PostItems.js";

const router = express.Router();

// GET /api/items/success-stories
router.get("/success-stories", async (req, res) => {
    try {
        const items = await Item.find({ status: "Found" });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/items/:id/found
router.put("/:id/found", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, title, description, category } = req.body;

        // 1. Update the original PostItem status
        const lostItem = await PostItems.findByIdAndUpdate(
            id,
            { status: "Found" },
            { new: true }
        );
        if (!lostItem) return res.status(404).json({ error: "Item not found" });

        // 2. Check if this item is already in success stories
        const alreadyExists = await Item.findOne({ originalId: id });
        if (alreadyExists) {
            return res.json({ message: "Already added to success stories", foundItem: alreadyExists });
        }

        // 2. Save into SuccessStories collection
        const foundItem = new Item({
            title: lostItem.title,
            description: lostItem.description,
            category: lostItem.category,
            file: lostItem.file,
            status: "Found",
            reportedBy: {
                name: lostItem.name,
                email: lostItem.email,
                phone: lostItem.phone,
            },
            foundBy: {
                name,
                email,
                phone,
                title,
                description,
                category,
                reportedAt: new Date(),
            },
        });

        await foundItem.save();

        res.json({ lostItem, foundItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;
