import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from "react-chartjs-2";
import { withTheme } from "styled-components";

const PlayerWarResultsChart = ({ theme, height, title, cardHeader, data }) => {
    const width = window.innerWidth;
    let mobile = false;
    if (width <= 768) {
        mobile = true;
    }
    return (
        <div className="card">
            { cardHeader && <div className="card-header">{ cardHeader }</div> }
            <Doughnut
                height={ height + (mobile ? 80 : 0) }
                data={ {
                    datasets: [
                        {
                            data: [data.wins, data.battles - data.wins, data.availables - data.battles],
                            backgroundColor: [theme.colors.green, theme.colors.orange, theme.colors.red]
                        },
                    ],
                    labels: ["Wins", "Losses", 'Misses'],
                } }
                options={ {
                    title: {
                        display: title.length > 0,
                        text: title
                    },
                    tooltips: {
                        callbacks: {
                            label: (tooltipItem, data) => {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const meta = dataset._meta[Object.keys(dataset._meta)[0]];
                                const currentValue = dataset.data[tooltipItem.index];
                                return `${ currentValue } (${ Number(currentValue / meta.total * 100).toFixed(1) }%)`;
                            },
                            title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
                        }
                    },
                } }
            />
        </div>
    );
};

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

export default withTheme(PlayerWarResultsChart)