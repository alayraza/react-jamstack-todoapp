const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb"),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    allTasks: [Task]
  }
  type Mutation {
    addTask(text: String!): Task
    updateTask(id: ID!): Task
    deleteTask(id: ID!): Task
  }
  type Task {
    id: ID!
    text: String!
    completed: Boolean!
  }
`;

const client = new faunadb.Client({
  secret: "fnAD7pp2tLACAVS4s2El-5uR4wm_Z2EuuGRWIPDQ",
});
const resolvers = {
  Query: {
    allTasks: async (root, args, context) => {
      try {
        const result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("all_my_todos"))),
            q.Lambda((x) => q.Get(x))
          )
        );
        const data = result.data.map((d) => {
          return {
            id: d.ref.id,
            completed: d.data.completed,
            text: d.data.text,
          };
        });
        // console.log(data);
        // console.log(result.data);

        return data;
      } catch (error) {
        console.log(error);
        return error.toString();
      }
    },
  },
  Mutation: {
    addTask: async (_, { text }) => {
      try {
        const result = await client.query(
          q.Create(q.Collection("my_todos"), {
            data: {
              text,
              completed: false,
            },
          })
        );
        // console.log(result.data.task);
        return result.data;
      } catch (error) {
        return error.toString();
      }
    },
    deleteTask: async (_, { id }) => {
      try {
        const reqId = JSON.stringify(id);
        const reqId2 = JSON.parse(id);
        console.log(id);

        const result = await client.query(
          q.Delete(q.Ref(q.Collection("my_todos"), id))
        );
        console.log(result);
        return result.data;
      } catch (error) {
        return error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
