import React from 'react';
import styled, { withTheme } from "styled-components";

const NavBar = styled.nav`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    background: ${ ({ theme }) => theme.colors.dark };
    padding: .1rem 1rem;
`;

const Link = styled.a`
    color: ${ ({ theme }) => theme.colors.white };
    display: inline-block;
    padding: .3125rem 0;
    margin-right: 1rem;
    font-size: 1.25rem;
    line-height: inherit;
    white-space: nowrap;
`;

const Brand = styled.img`
    vertical-align: initial;
    height: 30px;
`;

const TopBar = () => {
    return (
        <NavBar>
            <Link href={ window.GLOBAL_rootURL }><Brand src="/img/logo_name_beside.png" alt="Logo"/></Link>
        </NavBar>
    );
};

export default withTheme(TopBar);