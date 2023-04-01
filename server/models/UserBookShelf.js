

import { model, Schema } from "mongoose";

const userBookShelf = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collectionType: {
        type: String,
        enum: ['WANT_TO_READ', 'READING', 'READ'],
        required: true
    }
});


export default model("UserShelf", userBookShelf);
