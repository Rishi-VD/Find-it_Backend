import mongoose from "mongoose";

const PostItemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
    }
}, { timestamps: true });


export default mongoose.model("PostItems", PostItemsSchema);