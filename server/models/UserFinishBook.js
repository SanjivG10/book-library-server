
import { model, Schema } from "mongoose";

const userFinishedBookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    finished: {
        type: Boolean,
        default: false
    }
});


export default model("BookFinish", userFinishedBookSchema);