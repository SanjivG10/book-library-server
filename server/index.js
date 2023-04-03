import mongoose from "mongoose";
import { httpServer, server, app } from "./app.js";
import { MONGODB_URI } from "./constants/env-keys.js";

(async () => {
    try {
        await mongoose
            .connect(MONGODB_URI)
        await server.start();
        server.applyMiddleware({ app });
        httpServer.listen(4000, () => {
            console.log("listening on port 4000");
        });
    }
    catch (err) {
        console.log(err);
        console.log("Something went wrong");
    }
})();
