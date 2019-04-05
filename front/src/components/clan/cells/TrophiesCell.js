import React from 'react';
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";

export default class TrophiesCell extends React.Component {
    render() {
        const { arena, league, trophies } = this.props;
        const _arena = arena ? images.arena(arena) : images.league(league);
        return (
            <span className="trophy-td">
                <img src={_arena} />
                {Number(trophies).toLocaleString(locale)}
            </span>
        );
    }
}