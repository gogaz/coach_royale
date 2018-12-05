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
    data2() {
        return {
            labels: [ "Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running" ],
            datasets: [
                {
                    label: "My First dataset",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: rand(32, 100, 7)
                }
            ]
        };
    }
}