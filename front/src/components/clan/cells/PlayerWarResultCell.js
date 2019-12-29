import React from 'react'
import { images } from "../../../helpers/assets";
import PropTypes from 'prop-types';
import styled from "styled-components";

const WarResult = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
        height: 30px;
    }
`;

const PlayerWarResultCell = ({ war }) => {
    if (!war)
        return <WarResult/>;

    let result = [];
    for (let i = 0; i < war.final_battles_wins; i++)
        result = [...result, <img alt="Final battle won" src={ images.static('warWon') } key={ 'win' + i }/>];
    for (let i = 0; i < war.final_battles_done - war.final_battles_wins; i++)
        result = [...result, <img alt="Final battle lost" src={ images.static('warLost') } key={ 'lose' + i }/>];
    for (let i = 0; i < war.final_battles_misses; i++)
        result = [...result, <img alt="Final battle missed" src={ images.static('warYet') } key={ 'yet' + i }/>];

    return <WarResult>{ result }</WarResult>
};

PlayerWarResultCell.propTypes = {
    war: PropTypes.object,
};

export default PlayerWarResultCell;