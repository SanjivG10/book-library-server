const { model, Schema } = require("mongoose");

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
    collection: {
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

export default model("Book", bookSchema);
