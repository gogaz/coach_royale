import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Line } from "react-chartjs-2";
import { Body, Card, Header } from "../../ui/Card";

const PlayerDiffStatsChart = ({ height, datasets, title, cardHeader, data, legend }) => {
    const width = window.innerWidth;
    let mobile = false;
    if (width <= 768) {
        mobile = true;
    }
    return (
        <Card>
            { cardHeader && <Header>{ cardHeader }</Header> }
            <Body>
                <Line height={ height + (mobile ? 80 : 0) }
                      data={ {
                          datasets: datasets.map(e => {
                              return { ...e, data: data.map(x => x[e.id]) }
                          }),
                          labels: data.map(e => moment(e.timestamp).format('DD/MM')),
                      } }
                      options={ {
                          legend: legend,
                          scales: {
                              yAxes: [{
                                  display: true,
                                  beginAtZero: true,
                              }]
                          },
                          title: {
                              display: title.length > 0,
                              text: title
                          }
                      } }
                />
            </Body>
        </Card>
    );
};

PlayerDiffStatsChart.defaultProps = {
    height: 120,
    title: "",
    cardHeader: undefined,
    legend: { display: false },
};
PlayerDiffStatsChart.propTypes = {
    height: PropTypes.number,
    datasets: PropTypes.arrayOf(PropTypes.object), // an extra `id` field MUST be added
    data: PropTypes.arrayOf(PropTypes.object),
    options: PropTypes.object,
    title: PropTypes.string,
    legend: PropTypes.object,
    cardHeader: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default PlayerDiffStatsChart;