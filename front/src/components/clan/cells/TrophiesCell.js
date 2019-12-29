import React, { useContext, useState } from 'react';
import styled from "styled-components";
import { images } from "../../../helpers/assets";
import { locale } from "../../../helpers/browser";
import { ConstantsContext, playerArenaFromTrophies } from "../../../helpers/constants";

const Image = styled.img`
    height: 1.5rem;
`;

const TrophiesCell = ({ arena, trophies }) => {
    if (!arena && !trophies)
        return null;

    const [arenaImage, setArenaImage] = useState(null);
    const constants = useContext(ConstantsContext);

    constants.then((data) => setArenaImage(playerArenaFromTrophies(data, trophies)));

    return (
        <React.Fragment>
            { arenaImage && <Image src={ images.arena(arenaImage) }/> }
            { Number(trophies).toLocaleString(locale) }
        </React.Fragment>
    );
};

export default TrophiesCell;