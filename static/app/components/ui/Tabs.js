import React from "react";
import styled, { withTheme } from "styled-components";
import { NavTab } from 'react-router-tabs';


const TabsContainer = withTheme(styled.ul`
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
`);

const Tab = withTheme(styled.li`   
`);

const TabLink = withTheme(styled(NavTab)`
    display: block;
    padding: .5rem 1rem;
    
    &.active {
      color: #fff;
      background-color: ${({ theme }) => theme.colors.blue};
    }
`)

export {
    TabsContainer,
    Tab,
    TabLink
}