import { model, Schema } from "mongoose";

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        required: true,
    },
    collectionType: {
        type: String,
        enum: ["WANT_TO_READ", "READING", "READ"],
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

bookSchema.statics.findWithPagination = async function (limit, page) {
    const skip = (page - 1) * limit;
    const books = await this.find().skip(skip).limit(limit).sort({ "_id": -1 });
    return books;
};

export default model("Book", bookSchema);
