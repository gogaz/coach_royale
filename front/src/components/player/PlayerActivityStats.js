import React from 'react';
import { Line } from 'react-chartjs-2';

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
            return (
                <div className="row player-charts">
                    <div className="col-6 card">
                        <Line data={this.chartCountData()} height={50}/>
                    </div>
                    <div className="col-6 card">
                        <Line data={this.chartTrophiesData()} height={50}
                              options={{
                                  min: Math.min(...this.getChartData('current_trophies')),
                                  max: Math.max(...this.getChartData('highest_trophies')),
                              }}/>
                    </div>
                </div>
            );
        return null;
    }
    getChartData(chart, defaultVal) {
        return this.state.data.diff.map(e => {
                if (e) return e[chart];
                return defaultVal || 0;
            })
    }
    chartTrophiesData() {
        return {
            labels: this.state.data.labels,
            datasets: [
                {
                    label: "Trophies",
                    data: this.getChartData('current_trophies'),
                },
                {
                    label: "Highest",
                    data: this.getChartData('highest_trophies'),
                }
            ]
        };
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