
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import { createServer } from 'http';
import BookMutation from "./graphql/resolvers/mutations/Book.mutation.js";
import UserMutation from "./graphql/resolvers/mutations/User.mutation.js";
import BookQuery from "./graphql/resolvers/queries/Book.query.js";
import MeQuery from "./graphql/resolvers/queries/me.query.js";
import BookSubscription from "./graphql/resolvers/subscriptions/Book.subscription.js";
import typeDefs from "./graphql/schema/schema.graphql.js";
import upload from "./utils/fileUpload.js";

import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

const pubsub = new PubSub();

export const app = express();


app.use(cors());

export const httpServer = createServer(app);

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

export const server = new ApolloServer({
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

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("coverImage"), (req, res) => {
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file.path,
    });
});

