import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Bar } from "react-chartjs-2";

import { Card, Header } from "../../ui/Card";

const PlayerRecentBattlesResultsChart = ({ theme, data, height, datasets, title, cardHeader }) => {
    const width = window.innerWidth;
    let mobile = false;
    if (width <= 768)
        mobile = true;

    const labels = data.reduce((result, elem, i) => {
        if (i > 0) result.push(moment(elem.timestamp).short());
        return result;
    }, []);

    const chartData = (field) => {
        data.reduce((result, elem, i, data) => {
            if (i > 0) {
                if (isNaN(elem[field])) {
                    result.push(elem[field]);
                } else {
                    let diff = Number(elem[field]) - Number(data[i - 1][field]);
                    result.push(diff)
                }
            }
            return result;
        }, []);
    };

    return (
        <Card>
            { cardHeader && <Header>{ cardHeader }</Header> }
            <Bar height={ height + (mobile ? 80 : 0) }
                 data={ {
                     datasets: datasets.map(e => {
                         return { ...e, data: chartData(e.id) }
                     }),
                     labels,
                 } }
                 options={ {
                     scales: {
                         yAxes: [{
                             display: true,
                             stacked: true,
                             stepSize: 1,
                         }],
                         xAxes: [{
                             stacked: true,
                         }]
                     },
                     title: {
                         display: title.length > 0,
                         text: title
                     }
                 } }
            />
        </Card>
    );
};

PlayerRecentBattlesResultsChart.defaultProps = {
    height: 120,
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

export default PlayerRecentBattlesResultsChart;