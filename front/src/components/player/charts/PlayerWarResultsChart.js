import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from "react-chartjs-2";

export default class PlayerWarResultsChart extends React.Component {
    render() {
        const {height, title, cardHeader, data} = this.props;
        const width = window.innerWidth;
        let mobile = false;
        if (width <= 768) {
            mobile = true;
        }
        return (
            <div className="card">
                {cardHeader && <div className="card-header">{cardHeader}</div>}
                <Doughnut height={height + (mobile ? 80 : 0)}
                      data={{
                          datasets: [
                              {
                                  data: [data.wins, data.battles - data.wins, data.availables - data.battles],
                                  backgroundColor: ["#28a745", "#F7CA18", "#c45850"]
                              },
                          ],
                          labels: ["Wins", "Losses", 'Misses'],
                      }}
                      options={{
                          scales: {
                              yAxes: [{
                                  display: true,
                                  beginAtZero: true,
                                  stepSize: 1,
                                  ticks: {
                                      callback: val => val > 0 ? '+' + val : val
                                  }
                              }]
                          },
                          title: {
                              display: title.length > 0,
                              text: title
                          }
                      }}
                />
            </div>
        );
    }
}
PlayerWarResultsChart.defaultProps = {
    height: 100,
    title: "",
    cardHeader: undefined,
};
PlayerWarResultsChart.propTypes = {
    height: PropTypes.number,
    data: PropTypes.object.isRequired,
    options: PropTypes.object,
    title: PropTypes.string,
    cardHeader: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};