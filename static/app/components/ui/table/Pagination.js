import React from 'react'
import styled, { withTheme } from 'styled-components'
import FontAwesomeIcon from 'components/ui/FontAwesome'

const PaginationControls = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`;

const Pagination = ({
    gotoPage,
    previousPage,
    canPreviousPage,
    nextPage,
    canNextPage,
    pageCount,
    pageOptions,
    pageIndex,
}) => {
    if (!canNextPage && !canPreviousPage)
        return null;
    return (
        <PaginationControls>
            <div className="btn-group">
                <button
                    disabled={ !canPreviousPage }
                    onClick={ () => gotoPage(0) }
                    className="btn btn-light"
                >
                    <FontAwesomeIcon icon="angle-double-left"/>
                </button>

                <button
                    disabled={ !canPreviousPage }
                    onClick={ () => previousPage() }
                    className="btn btn-light"
                >
                    <FontAwesomeIcon icon="angle-left"/>
                </button>
            </div>

            <span className="label">{ pageIndex + 1 } / { pageOptions.length }</span>

            <div className="btn-group">
                <button
                    disabled={ !canNextPage }
                    onClick={ () => nextPage() }
                    className="btn btn-light"
                >
                    <FontAwesomeIcon icon="angle-right"/>
                </button>

                <button
                    onClick={ () => gotoPage(pageCount - 1) }
                    disabled={ !canNextPage }
                    className="btn btn-light"
                >
                    <FontAwesomeIcon icon="angle-double-right"/>
                </button>
            </div>
        </PaginationControls>
    )
};

export default withTheme(Pagination);