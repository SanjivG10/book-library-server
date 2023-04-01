import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import typeDefs from "./graphql/schema/schema.graphql.js";
import UserMutation from "./graphql/resolvers/mutations/User.mutation.js";
import BookMutation from "./graphql/resolvers/mutations/Book.mutation.js";
import BookQuery from "./graphql/resolvers/queries/Book.query.js";
import BookSubscription from "./graphql/resolvers/subscriptions/Book.subscription.js";
import MeQuery from "./graphql/resolvers/queries/me.query.js";
import { MONGODB_URI } from "./constants/env-keys.js";
import upload from "./utils/fileUpload.js";
import { createServer } from 'http';

import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const app = express();
app.use(cors());

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Mutation: {
            ...UserMutation,
            ...BookMutation
        },
        Query: {
            ...BookQuery,
            ...MeQuery
        },
        Subscription: {
            ...BookSubscription
        }
    },
});

const wsServer = new WebSocketServer({
    server: httpServer,
});

const serverCleanup = useServer({
    schema, context: {
        pubsub
    }
}, wsServer);

const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, pubsub }),

    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ]
});


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


app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("coverImage"), (req, res) => {
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file.path,
    });
});
