import React from 'react';

const LineChart = require("react-chartjs").Line;

export default class PlayerActivityStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
        }
    }
    componentDidMount() {
        this.fetchData();
    }
    fetchData() {
        const url = this.props.endpoint + '/activity';
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
        if (this.state.data.labels !== undefined)
            return <LineChart data={this.chartCountData()} options={{
                scales: {
                    yAxes: [ {
                        ticks: {
                            beginAtZero: true
                        }
                    } ]
                }
            }} width="600" height="250" />;
        return null;
    }
    chartCountData() {

        return {
            labels: this.state.data.labels,
            datasets: [
                {
                    label: "Connections per day",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: this.state.data.count
                }
            ]
        };
    }
}