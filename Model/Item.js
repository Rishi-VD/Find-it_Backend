import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        // Lost item details (Reported By)
        reportedBy: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        status: { type: String, default: "Lost" },
        file: { type: String },

        // Found person details
        foundBy: {
            name: { type: String },
            email: { type: String },
            phone: { type: String },
            title: { type: String },
            description: { type: String },
            category: { type: String },
            reportedAt: { type: Date },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Item", itemSchema);


