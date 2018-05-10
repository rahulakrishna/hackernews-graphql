import React from 'react';
import Link from './Link';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../utils/constants';

class LinkList extends React.Component {
  componentDidMount() {
    console.log(this.props.feedQuery.feed);
  }
  _updateCacheAfterVote = (store,createVote,linkId) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;

    const data = store.readQuery({ query: FEED_QUERY, variables: { first, skip, orderBy } });
    const votedLink = data.feed.links.find((link) => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    store.writeQuery({ query:FEED_QUERY, data });
  }
  _getLinksToRender = (isNewPage) => {
    if( isNewPage ) {
      console.log(this.props);
      return this.props.feedQuery.feed.links;
    }
    const rankedLinks =  this.props.feedQuery.feed.links.slice();
    rankedLinks.sort(((l1,l2)=> l2.votes.length - l1.votes.length));
    return rankedLinks;
  }
  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if(page >= 1) {
      const prevPage = page - 1;
      this.props.history.push(`/new/${prevPage}`);
    }
  }
  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  }
  render() {
    const { feedQuery } = this.props;
    console.log(feedQuery);
    if(feedQuery.loading || feedQuery.error) {
      return <div>Loading...</div>;
    }
    const isNewPage = this.props.location.pathname.includes('new');
    const linksToRender = this._getLinksToRender(isNewPage);
    const page = parseInt(this.props.match.params.page, 10);
    return(
      <div>
        {(feedQuery.loading)?<div>Loading...</div>:
          linksToRender.map((link,index)=>(<Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} index={index} link={link}/>))
        }
        {(feedQuery.error)&&<div>Error!</div>}
        {isNewPage &&
        <div className='flex ml4 mv3 gray'>
          <div className='pointer mr2' onClick={() => this._previousPage()}>Previous</div>
          <div className='pointer' onClick={() => this._nextPage()}>Next</div>
        </div>
        }
      </div>
    )
  }
}

export const FEED_QUERY = gql`
    query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
      feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
        count
      }
    }
`

export default graphql(FEED_QUERY,{
  name:'feedQuery',
  options: ownProps => {
    const page = parseInt(ownProps.match.params.page,10);
    const isNewPage = ownProps.location.pathname.includes('new');
    const skip = isNewPage ? (page -1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return {
      variables: {
        first: first,
        skip: skip,
        orderBy: orderBy
      }
    }
  }
})(LinkList);
