import React from 'react';
import styled from "styled-components";
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";
import { ConstantsContext, playerArenaFromTrophies } from "../../../helpers/constants";

const Image = styled.img`
    height: 1.5rem;
`;
export default class TrophiesCell extends React.Component {
    render() {
        const { arena, trophies } = this.props;
        const _arena = arena ? arena : playerArenaFromTrophies(this.context, trophies);
        if (!arena && !trophies)
            return null;
        return (
            <React.Fragment>
                <Image src={images.arena(_arena)} />
                {Number(trophies).toLocaleString(locale)}
            </React.Fragment>
        );
    }
}
TrophiesCell.contextType = ConstantsContext;