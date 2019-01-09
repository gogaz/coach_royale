import React from 'react';
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";

export default class TrophiesCell extends React.Component {
    render() {
        const { arena, trophies } = this.props;
        return (
            <span className="trophy-td">
                <img src={images.arena(arena)} />
                {Number(trophies).toLocaleString(locale)}
            </span>
        );
    }
}