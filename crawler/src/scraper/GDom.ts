import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql'

import axios from 'axios'
import cheerio from 'cheerio'

export function parse (query: string) {
  graphql(Schema, query)
}

const selector = {
  type: GraphQLString,
  description: 'DOM element selector'
}

const NodeType = new GraphQLObjectType({
  name: 'Node',
  fields() {
    return {
      text: {
        type: GraphQLString,
        args: { selector },
        resolve(root, args) {
          if (args.selector) {
            return cheerio(args.selector, root).text()
          }
          return cheerio(root).text()
        }
      },
      attr: {
        type: GraphQLString,
        args: {
          name: {
            type: GraphQLString,
            description: 'Name of needed attribute'
          },
          selector
        },
        resolve(root, args) {
          if (args.selector) {
            return cheerio(args.selector, root).attr(args.name);
          }
          return cheerio(root).attr(args.name);
        }
      },
      next: {
        type: NodeType,
        args: { selector },
        resolve(root, args) {
          if (args.selector) {
            return cheerio(args.selector, root).next()
          }
          return cheerio(root).next()
        }
      },
      nextAll: {
        type: new GraphQLList(NodeType),
        args: { selector },
        resolve(root, args) {
          const items = root(args.selector)
          const arr = []
          items.each((i, item) => {
            arr.push(item)
          })
          return arr
        }
      },
      tag: {
        type: GraphQLString,
        args: { selector },
        resolve(root, args) {
          if (args.selector) {
            return cheerio(args.selector, root).get(0).tagName
          }
          return cheerio(root).get(0).tagName
        }
      },
      html: {
        type: GraphQLString,
        args: { selector },
        resolve(root, args) {
          if (args.selector) {
            return cheerio(args.selector, root).html()
          }
          return cheerio(root).html()
        }
      },
      parent: {
        type: NodeType,
        resolve(root) {
          return cheerio(root).parent()
        }
      },
      query: {
        type: new GraphQLList(NodeType),
        args: { selector },
        resolve(root, args) {
          const items = cheerio(args.selector, root)
          const arr = []
          items.each((i, item) => {
            arr.push(item)
          })
          return arr
        }
      }
    }
  }
})

export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      page: {
        type: NodeType,
        args: {
          url: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Page url'
          }
        },
        resolve(root, args) {
          return axios.get(args.url)
            .then(response => response.data)
        }
      }
    }
  })
})