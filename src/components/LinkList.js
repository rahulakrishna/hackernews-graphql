import React from 'react';
import Link from './Link';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class LinkList extends React.Component {
  componentDidMount() {
    console.log(this.props.feedQuery.feed);
  }
  _updateCacheAfterVote = (store,createVote,linkId) => {
    const data = store.readQuery({ query: FEED_QUERY });

    const votedLink = data.feed.links.find((link) => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query:FEED_QUERY, data });
  }
  render() {
    const { feedQuery } = this.props;
    console.log(feedQuery);
    return(
      <div>
        {feedQuery.networkStatus}
        {(feedQuery.loading)?<div>Loading...</div>:
          feedQuery.feed.links.map((link,index)=>(<Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} index={index} link={link}/>))
        }
        {(feedQuery.error)&&<div>Error!</div>}
      </div>
    )
  }
}

export const FEED_QUERY = gql`
    query FeedQuery {
      feed {
        links {
          id
          description
          url
          createdAt
          postedBy{
            id
            name
          }
          votes{
            id
            user{
              id
            }
          }
        }
      }
    }
`

export default graphql(FEED_QUERY,{name:'feedQuery'})(LinkList);
