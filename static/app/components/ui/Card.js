import React from "react";
import styled, { withTheme } from "styled-components";

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    word-wrap: break-word;
    background-color: ${ ({ theme }) => theme.colors.white };
    border: 1px solid ${ ({ theme }) => theme.colors.lightGray };
    border-radius: .25rem;
`;

export const Header = styled.div`
    padding: .75rem 1.25rem;
    margin-bottom: 0;
    background-color: ${ ({ theme }) => theme.colors.light };
    border-bottom: 1px solid ${ ({ theme }) => theme.colors.lightGray };
`;

export const Body = styled.div`
    flex: 1 1 auto;
    padding: 1.25rem;
`;

export const Footer = styled.div`
    padding: .75rem 1.25rem;
    background-color: ${ ({ theme }) => theme.colors.light };
    border-top: 1px solid ${ ({ theme }) => theme.colors.lightGray };
`;
