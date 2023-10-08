import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'node-fetch';

let idCount = 2;
let tweets = [
  {
    id: '1',
    text: 'Hello world',
    authorId: '1',
  },
  {
    id: '2',
    text: 'Second tweet',
    authorId: '2',
  }
];
let users = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    id: '2',
    firstName: 'Yusung',
    lastName: 'Kim',
  }
]

// The GraphQL schema
const typeDefs = `#graphql
"""
User who can post tweets
"""
type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    firstName + lastName
    """
    fullName: String!
  }

  """
  A tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }

  type Query {
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allUsers: [User!]!
    user(id: ID!): User!
    allMovie(limit: Int): [Movie!]!
    movie(id: ID!): Movie!
  }

  type Mutation {
    postTweet(text: String!, id: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }

  """
  Movie detail from REST API of https://yts.mx/api/v2/movie_details.json?movie_id=
  """
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    download_count: Int
    like_count: Int
    summary: String
    synopsis: String
    description_intro: String
    description_full: String!
    yt_trailer_code: String!
    language: String!
    mpa_rating: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
    date_uploaded: String!
    date_uploaded_unix: Int!
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    allTweets: () => tweets,
    tweet(_, { id }) {
      return tweets.find(tweet => tweet.id === id);
    },
    allUsers: () => users,
    user(_, { id }) {
      return users.find(user => user.id === id);
    },
    async allMovie(_, { limit }) {
      const res = await fetch(`https://yts.mx/api/v2/list_movies.json?limit=${limit || 10}`);
      const json = await res.json();
      return json.data.movies;
    },
    async movie(_, { id }) {
      const res = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`);
      const json = await res.json();
      return json.data.movie;
    }
  },
  Mutation: {
    postTweet(_, {text, authorId}) {
      const tweet = {
        id: idCount++,
        text,
        authorId,
      };
      tweets.push(tweet);
      return tweet;
    },
    deleteTweet(_, {id}) {
      const tweet = tweets.find(tweet => tweet.id === id);
      if(tweet) {
        tweets = tweets.filter(tweet => tweet.id !== id);
        return true;
      }
      return false;
    }
  },
  User: {
    fullName(root) {
      console.log("fullName resolver called")
      console.log("root", root)
      return `${root.firstName} ${root.lastName}`;
    }
  },
  Tweet: {
    author: (root) => {
      return users.find(user => user.id === root.authorId);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);