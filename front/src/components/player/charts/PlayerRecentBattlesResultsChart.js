import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Bar } from "react-chartjs-2";

export default class PlayerRecentBattlesResultsChart extends React.Component {

    getLabels() {
        return this.props.data.reduce((result, elem, i) => {
            if (i > 0)
                result.push(moment(elem.timestamp).short());
            return result;
        }, []);
    }
    getData(field) {
        return this.props.data.reduce((result, elem, i, data) => {
            if (i > 0) {
                if (isNaN(elem[field])) {
                    result.push(elem[field]);
                }
                else {
                    let diff = Number(elem[field]) - Number(data[i - 1][field]);
                    result.push(diff)
                }
            }
            return result;
        }, []);
    }
    render() {
        const {height, datasets, title, cardHeader} = this.props;
        const width = window.innerWidth;
        let mobile = false;
        if (width <= 768) {
            mobile = true;
        }
        return (
            <div className="card">
                {cardHeader && <div className="card-header">{cardHeader}</div>}
                <Bar height={height + (mobile ? 80 : 0)}
                      data={{
                          datasets: datasets.map(e => {
                              return {...e, data: this.getData(e.id)}
                          }),
                          labels: this.getLabels(),
                      }}
                      options={{
                          scales: {
                              yAxes: [{
                                  display: true,
                                  stacked: true,
                                  stepSize: 1,
                                  ticks: {
                                      callback: val => val > 0 ? '+' + val : val
                                  }
                              }],
                              xAxes: [{
                                  stacked: true,
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
PlayerRecentBattlesResultsChart.defaultProps = {
    height: 100,
    title: "",
    cardHeader: undefined,
};
PlayerRecentBattlesResultsChart.propTypes = {
    height: PropTypes.number,
    datasets: PropTypes.arrayOf(PropTypes.object), // an extra `id` field MUST be added
    data: PropTypes.arrayOf(PropTypes.object),
    options: PropTypes.object,
    title: PropTypes.string,
    cardHeader: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};