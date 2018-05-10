import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FEED_QUERY } from './LinkList';
import { LINKS_PER_PAGE } from '../utils/constants';

class CreateLink extends React.Component {
  state = {
    description:'',
    url:''
  }
  _createLink = async () =>{
    console.log(this.state);
    const { description,url } = this.state;
    console.log(this.props);
    await this.props.postMutation({
      variables: {
        description:description,
        url:url
      },
      update:(store,{ data:post }) => {
        console.log(post);
        const isNewPage = this.props.location.pathname.includes('new')
        const page = parseInt(this.props.match.params.page, 10)
        const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
        const first = isNewPage ? LINKS_PER_PAGE : 100
        const orderBy = isNewPage ? 'createdAt_DESC' : null
        const data = store.readQuery({ query:FEED_QUERY, variables: { skip, first, page } });
        data.feed.links.splice(0,0,post);
        store.writeQuery({
          query: FEED_QUERY,
          data
        });
      }
    });
    this.props.history.push('/');
  }
  render() {
    return(
        <div>
          <div className="flex flex-column mt3">
            <input
              className="mb2"
              value={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
              type="text"
              placeholder="A description for the link"
            />
            <input
              className="mb2"
              value={this.state.url}
              onChange={e => this.setState({ url: e.target.value })}
              type="text"
              placeholder="The URL for the link"
            />
          </div>
          <button onClick={()=>this._createLink()}>Submit</button>
      </div>
    );
  }
}

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

export default graphql(POST_MUTATION,{name:'postMutation'})(CreateLink);
