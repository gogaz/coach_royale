import React from 'react';
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";
import { ConstantsContext, playerArenaFromTrophies } from "../../../helpers/constants";

export default class TrophiesCell extends React.Component {
    render() {
        const { arena, trophies } = this.props;
        const _arena = arena ? arena : playerArenaFromTrophies(this.context, trophies);
        if (!arena && !trophies)
            return null;
        return (
            <span className="trophy-td">
                <img src={images.arena(_arena)} />
                {Number(trophies).toLocaleString(locale)}
            </span>
        );
    }
}
TrophiesCell.contextType = ConstantsContext;