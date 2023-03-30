import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import typeDefs from "./graphql/schema/schema.graphql.js";
import Mutation from "./graphql/resolvers/Mutation.js";
import { MONGODB_URI } from "./constants/env-keys.js";


const app = express();
app.use(cors());
const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Mutation,
    },
    context: ({ req }) => ({ req }),
});



(async () => {
    try {
        await mongoose
            .connect(MONGODB_URI)
        await server.start();
        server.applyMiddleware({ app });
        app.listen(4000, () => {
            console.log("listening on port 4000");
        });
    }

    catch (err) {
        console.log(err);
        console.log("Something went wrong");
    }
})();
