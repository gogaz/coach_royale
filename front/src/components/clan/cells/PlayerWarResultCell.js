import React from 'react'
import { images } from "../../../helpers/assets";
import PropTypes from 'prop-types';

export default class PlayerWarResultCell extends React.Component {
    render() {
        const {war} = this.props;
        if (!war)
            return <div className="war-result"/>;
        let result = [];
        for (let i = 0; i < war.final_battles_wins; i++)
            result = [...result, <img src={images.static('warWon')} key={'win' + i} />];
        for (let i = 0; i < war.final_battles_done - war.final_battles_wins; i++)
            result = [...result, <img src={images.static('warLost')} key={'lose' + i} />];
        for (let i = 0; i < war.final_battles_misses; i++)
            result = [...result, <img src={images.static('warYet')} key={'yet' + i} />];

        return <div className="war-result">{result}</div>
    }
}

PlayerWarResultCell.propTypes = {
    war: PropTypes.object,
};