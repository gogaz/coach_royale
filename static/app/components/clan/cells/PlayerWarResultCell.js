import React from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { images } from 'helpers/assets';
import { locale } from 'helpers/browser';

const WarResult = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.light};
    }
`;

const WarMetric = styled.div`
    display: flex;
    justify-content: center;

    & > img {
        height: 20px;
        display: block;
    }
`

const Metric = ({ metric, image }) => (
    <WarMetric>
        {Number(metric).toLocaleString(locale)}
        {image}
    </WarMetric>
)

const PlayerWarResultCell = ({ war }) => {
    if (!war) {
        return <WarResult/>;
    }

    return (
        <WarResult>
            <Metric
                metric={war.fame}
                image={<img alt="Fame" src={images.static('cw-fame')} height={20}/>}
            />
            <Metric
                metric={war.repair_points}
                image={<img alt="Repair points" src={images.static('cw-repair')} height={20}/>}
            />
        </WarResult>
    )
};

PlayerWarResultCell.propTypes = {
    war: PropTypes.object,
};

export default PlayerWarResultCell;
