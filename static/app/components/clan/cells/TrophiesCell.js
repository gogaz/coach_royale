import React from 'react';
import styled from 'styled-components'
import { images } from 'helpers/assets';
import { locale } from 'helpers/browser';

const Image = styled.img`
    height: 1.5rem;
`;

const TrophiesCell = ({ arena, trophies }) => {
    if (!arena && !trophies)
        return null;

    return (
        <React.Fragment>
            { arena && <Image src={ images.arena(arena) }/> }
            { trophies && Number(trophies).toLocaleString(locale) }
        </React.Fragment>
    );
};

export default TrophiesCell;