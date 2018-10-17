import React from 'react';

export default class PlayerActivityStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {players: []},

        }
    }
    componentDidMount() {
        this.fetchData();
    }
    fetchData() {
        const url = this.state.endpoint + '/activity';
        fetch(url)
            .then((res) => res.json())
            .then(result => {
                this.setState({data: result, loading: false});
            })
            .catch((error) => {
                console.log(error)
            });
    }
    render() {
        return null;
    }
}