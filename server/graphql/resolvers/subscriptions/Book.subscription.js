
const Subscription = {
    bookUpdate: {
        subscribe: (_, __, { pubsub }) => {
            return pubsub.asyncIterator(["BOOK_UPDATED"]);
        }
    },
};
export default Subscription;
