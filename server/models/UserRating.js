
import { model, Schema } from "mongoose";

const userBookRating = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});


export default model("UserRating", userBookRating);
