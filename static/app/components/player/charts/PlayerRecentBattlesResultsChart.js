import React from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/moment'
import { withTheme } from 'styled-components'
import { Bar } from 'react-chartjs-2'

import { Card, Header as CardHeader, Body as CardBody } from 'components/ui/Card'
import { useAutoFetch } from "hooks/useAxios";
import Loading from "components/ui/Loading";

// For a given dataset, we make the diff of each data point with the previous value to get the number of battles done
//   during the 2 snapshots.
// The data is a list of player histories (PlayerStatsHistory or whichever) returned by the backend. The datasets
//   are a list of objects that must at least contain an id an a label and the id must be an attribute of the given model values.
const PlayerRecentBattlesResultsChart = ({ endpoint, height, theme }) => {
    const { loading, response: data } = useAutoFetch(endpoint + '/stats_per_day', {})

    const datasets = [
        {
            label: "2v2",
            id: "draws",
            backgroundColor: theme.colors.blue,
        },
        {
            label: "Losses",
            id: "losses",
            backgroundColor: theme.colors.orange,
        },
        {
            label: "Wins",
            id: "wins",
            backgroundColor: theme.colors.green,
        },
    ]

    if (loading)
        return <Card><Loading /></Card>

    const width = window.innerWidth;
    let mobile = width <= 768;

    const labels = data.reduce((result, elem, i) => {
        if (i > 0) {
            result.push(moment(elem.timestamp).isSame(new Date(), 'day') ? 'today' : moment(elem.timestamp).startOf('day').short());
        }
        return result;
    }, []);

    const chartData = (field) => (
        data.reduce((result, elem, i, data) => {
            if (i > 0) {
                if (isNaN(elem[field])) {
                    return result;
                } else {
                    const diff = Number(elem[field]) - Number(data[i - 1][field]);
                    result.push(diff)
                }
            }
            return result;
        }, [])
    );

    return (
        <Card>
            <CardBody>
                <Bar height={ height + (mobile ? height * (2 / 3) : 0) }
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
                             text: "Player battles"
                         }
                     } }
                />
            </CardBody>
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

export default withTheme(PlayerRecentBattlesResultsChart);
