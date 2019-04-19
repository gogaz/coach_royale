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
                          title: {
                              display: title.length > 0,
                              text: title
                          },
                          tooltips: {
                              callbacks: {
                                  label: function (tooltipItem, data) {
                                      const dataset = data.datasets[ tooltipItem.datasetIndex ];
                                      const meta = dataset._meta[ Object.keys(dataset._meta)[ 0 ] ];
                                      const currentValue = dataset.data[ tooltipItem.index ];
                                      const percentage = parseFloat((currentValue / meta.total * 100).toFixed(1));
                                      return currentValue + ' (' + percentage + '%)';
                                  },
                                  title: function (tooltipItem, data) {
                                      return data.labels[ tooltipItem[ 0 ].index ];
                                  }
                              }
                          },
                      }}
                />
            </div>
        );
    }
}
PlayerWarResultsChart.defaultProps = {
    height: 120,
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