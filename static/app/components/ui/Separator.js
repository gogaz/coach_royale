import React from "react";
import styled, { withTheme } from "styled-components";

const Separator = styled.div`
    height: 0;
    width: ${({ width }) => width || '100%'};
    margin-top: ${({ marginTop }) => marginTop || '5px'};
    margin-bottom: ${({ marginBottom }) => marginBottom || '5px'};
    border-bottom-style: solid;
    border-bottom-width: ${({ height }) => height || '1px'};
    border-bottom-color: ${({ color, theme }) => color || theme.colors.light2};
`;

export default withTheme(Separator)