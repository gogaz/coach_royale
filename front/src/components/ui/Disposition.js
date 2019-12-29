import React from "react";
import styled from "styled-components";

export const Grid = styled.div`
    display: grid;
    
    ${ ({ theme, columns }) => {
        const keys = columns ? Object.keys(columns) : [];
        if (keys.length === 1)
            return `grid-template-columns: repeat(${ columns[keys[0]] }, 1fr);`;
        return keys.map((key) => {
            return `
                    @media (${ theme.breakpoints[key] }) {
                        grid-template-columns: repeat(${ columns[key] }, 1fr);
                    }
            `;
        })
    } }
`;

export const FlexWrapper = styled.div`
    display: flex;
    flex-direction: ${({direction}) => direction};
`;

export const Flex = styled.div`
    flex: ${ ({ grow, shrink, basis }) => `${grow || 0} ${shrink || 1} ${basis || 'auto'}`};
`;