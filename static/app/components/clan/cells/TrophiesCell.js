import React, { useContext, useState } from 'react';
import styled from "styled-components";
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";
import { ConstantsContext, playerArenaFromTrophies } from "../../../helpers/constants";

const Image = styled.img`
    height: 1.5rem;
`;

const TrophiesCell = ({ arena, trophies }) => {
    const { playerArenaFromTrophies } = useContext(ConstantsContext);

    if (!arena && !trophies)
        return null;

    if (!arena)
        arena = playerArenaFromTrophies(trophies).arena;

    return (
        <React.Fragment>
            { arena && <Image src={ images.arena(arena) }/> }
            { trophies && Number(trophies).toLocaleString(locale) }
        </React.Fragment>
    );
};

export default TrophiesCell;