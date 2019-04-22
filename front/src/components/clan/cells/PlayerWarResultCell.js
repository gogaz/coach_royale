import React from 'react'
import { images } from "../../../helpers/assets";
import PropTypes from 'prop-types';

export default class PlayerWarResultCell extends React.Component {
    render() {
        const {war} = this.props;
        /* FIXME: This is a workaround for issue RoyaleAPI#333 */
        if (!war)
            return <div className="war-result"/>;
        let result = [];
        const wins = war.final_battles_wins;
        const lose = war.final_battles_done - war.final_battles_wins;
        for (let i = 0; i < wins; i++)
            result = [...result, <img src={images.static('warWon')} key={'win' + i} />];
        for (let i = 0; i < lose; i++)
            result = [...result, <img src={images.static('warLost')} key={'lose' + i} />];
        if (wins === 0 && lose === 0)
            result = [...result, <img src={images.static('warYet')} key={'yet'} />];

        return <div className="war-result">{result}</div>
    }
}

PlayerWarResultCell.propTypes = {
    war: PropTypes.object,
};