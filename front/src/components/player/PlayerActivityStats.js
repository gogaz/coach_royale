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
                    fillColor: "rgba(220, 207, 64,0.2)",
                    strokeColor: "#dccf40",
                    pointColor: "#dcdb55",
                    pointStrokeColor: "#dcdb55",
                    pointHighlightFill: "#dcdb55",
                    pointHighlightStroke: "#dccf40",
                    backgroundColor: 'rgba(0, 0, 0, 0)',
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
                    strokeColor: "#dcdcdc",
                    pointColor: "#dcdcdc",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "#dcdcdc",
                    data: this.state.data.count
                }
            ]
        };
    }
    render() {
        if (this.state.data.labels !== undefined)
            return (
                <div className="row player-charts">
                    <div className="col-6 card">
                        <Line data={this.chartCountData()} height={60}
                              options={{
                                  scales: {
                                      yAxes: [{
                                          display: true,
                                          beginAtZero: true,
                                          stepSize: 1
                                      }]
                                  }
                              }}/>
                    </div>
                    <div className="col-6 card">
                        <Line data={this.chartTrophiesData()} height={60}
                              options={{
                                  scales: {
                                      yAxes: [{
                                          display: true,
                                          ticks: {
                                              min: Math.min(...this.getChartData('current_trophies')),
                                              max: Math.max(...this.getChartData('highest_trophies')),
                                          },
                                          maxTicksLimit: 3,
                                          stepSize: 100
                                      }]
                                  }
                              }}/>
                    </div>
                </div>
            );
        return null;
    }
}