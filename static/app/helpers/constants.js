import React, { useEffect, useState } from 'react'
import axios from 'axios'

export const CLAN_ROLES = { elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member" };

export const ConstantsContext = React.createContext({
    loading: true,
    error: null,
    arenas: [],
    clanRoles: CLAN_ROLES,
    playerArenasFromTrophies: () => 0,
});

const ConstantsProvider = ({children}) => {
    const [state, setState] = useState({
        loading: true,
        error: null,
        arenas: [],
        clanRoles: CLAN_ROLES,
    })
    useEffect(
         () => {
             axios.get('/static/constants/arenas.json')
                 .then((result) => {
                 setState((prevState) => ({
                     ...prevState,
                     loading: false,
                     error: null,
                     arenas: result.data,
                 }))
             })
         },
        []
    );

    const playerArenaFromTrophies = (trophies) => (
        state.arenas
            .filter((e) => e.arena !== 0)
            .find((e, i, array) => i === array.length - 1 || Number(trophies) < array[i + 1].trophy_limit)
    )

    return (
        <ConstantsContext.Provider
            value={{
                ...state,
                playerArenaFromTrophies,
            }}
        >
            {children}
        </ConstantsContext.Provider>
    )
};

export default ConstantsProvider;