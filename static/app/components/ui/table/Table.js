import React from "react";
import PropTypes from 'prop-types'
import { useFilters, usePagination, useTable, useSortBy } from "react-table";
import styled, { withTheme } from "styled-components";

import { DefaultColumnFilter } from './filters'
import FontAwesomeIcon from "../FontAwesome";
import Pagination from "./Pagination";

const StyledTable = styled.table`
    width: 100%;
    margin-bottom: 1rem;
    background-color: transparent;
    table-layout: fixed;
    
    thead > tr > th {
        padding: 5px;
        overflow: hidden;
        font-weight: 400;
    }
    
    td, th {
        vertical-align: middle;
        border-bottom: 1px solid ${ ({ theme }) => theme.colors.light2 };
    }
    
    tbody {
        tr > td {
          padding: 5px 7px;
        }
        
        tr:nth-of-type(odd) {
            background-color: ${ ({ theme }) => theme.colors.light };
        }
    
        tr:hover, tr:nth-of-type(odd):hover {
            background-color: ${ ({ theme }) => theme.colors.light3 };
        }
    }    
`;

const StyledHeaderCell = styled.th`
    overflow: hidden;
    white-space: nowrap;
`;

const StyledBodyCell = styled.td`
    // Useful when we want to use all the available space
    // Use with 'position: absolute;top:0;left:0;width:100%;height:100%;' in children
    position: relative;
    text-align: ${({ value }) => typeof value === 'number' ? 'right' : 'left'};
`;

const Table = ({
    columns,
    data,
    disableFilters,
    pageSize,
    sortBy,
    showPagination,
    filterTypes
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        state: {
            pageIndex,
        },
    } = useTable({
        columns,
        data,
        filterTypes,
        initialState: {
            pageSize: showPagination ? pageSize : data.length,
            sortBy
        }
    }, useFilters, useSortBy, usePagination)

    return (
        <React.Fragment>
            <StyledTable { ...getTableProps() }>
                <thead>
                { headerGroups.map(headerGroup => (
                    <tr { ...headerGroup.getHeaderGroupProps() }>
                        { headerGroup.headers.map(column => (
                            <StyledHeaderCell
                                width={column.width}
                                { ...column.getHeaderProps() }
                            >
                                <span { ...column.getSortByToggleProps() }>
                                    { column.render('Header') }
                                </span>
                                { column.isSorted && (column.isSortedDesc
                                    ? <FontAwesomeIcon icon="angle-down" />
                                    : <FontAwesomeIcon icon="angle-up" />
                                ) }
                                {!disableFilters &&
                                    <div>{ column.Filter ? column.render('Filter') : null }</div>
                                }
                            </StyledHeaderCell>
                        )) }
                    </tr>
                )) }
                </thead>
                <tbody { ...getTableBodyProps() }>
                { page.map(row => {
                    prepareRow(row);
                    return (
                        <tr { ...row.getRowProps() }>
                            { row.cells.map(cell => {
                                let cellProps = {...cell.getCellProps()};
                                if (cell.column.cellProps)
                                    cellProps = {...cellProps, ...cell.column.cellProps};
                                return (
                                    <StyledBodyCell { ...cellProps } value={cell.value}>
                                        { cell.render('Cell') }
                                    </StyledBodyCell>
                                )
                            }) }
                        </tr>
                    )
                }) }
                </tbody>
            </StyledTable>
            { showPagination && (
                <Pagination
                    canPreviousPage={ canPreviousPage }
                    canNextPage={ canNextPage }
                    gotoPage={ gotoPage }
                    nextPage={ nextPage }
                    pageCount={ pageCount }
                    pageIndex={ pageIndex }
                    pageOptions={ pageOptions }
                    previousPage={ previousPage }
                />
            ) }
        </React.Fragment>
    );
}

Table.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        Header: PropTypes.node.isRequired,
    })).isRequired,
    data: PropTypes.arrayOf(PropTypes.any).isRequired,
    disableFilters: PropTypes.bool,
    showPagination: PropTypes.bool,
    initialPageSize: PropTypes.number,
    filterTypes: PropTypes.object,
    sortBy: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        desc: PropTypes.bool,
    }))
}

Table.defaultProps = {
    filterTypes: {},
    showPagination: false,
    disableFilters: false,
    pageSize: 10,
    sortBy: [],
}

export default withTheme(Table);