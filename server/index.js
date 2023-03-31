import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import typeDefs from "./graphql/schema/schema.graphql.js";
import UserMutation from "./graphql/resolvers/mutations/User.mutation.js";
import BookMutation from "./graphql/resolvers/mutations/Book.mutation.js";
import BookQuery from "./graphql/resolvers/queries/Book.query.js";
import MeQuery from "./graphql/resolvers/queries/me.query.js";
import { MONGODB_URI } from "./constants/env-keys.js";
import upload from "./utils/fileUpload.js";


const app = express();
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("coverImage"), (req, res) => {
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file.path,
    });
});


const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Mutation: {
            ...UserMutation,
            ...BookMutation
        },
        Query: {
            ...BookQuery,
            ...MeQuery
        }
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
