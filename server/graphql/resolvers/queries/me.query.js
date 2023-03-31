import checkAuth from "../../../utils/auth.js";

const Query = {
    async me(_, __, context) {
        try {
            const user = checkAuth(context);
            return user;
        } catch (err) {
            throw new Error(err);
        }
    },
};

export default Query;
