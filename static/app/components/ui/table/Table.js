import React from 'react'
import PropTypes from 'prop-types'
import { useFilters, usePagination, useTable, useSortBy } from 'react-table'
import styled, { withTheme } from 'styled-components'

import FontAwesomeIcon from 'components/ui/FontAwesome'
import Pagination from './Pagination'

const StyledTable = styled.table`
    width: 100%;
    margin-bottom: 1rem;
    background-color: transparent;
    table-layout: fixed;

    thead > tr > th {
        padding: 5px;
        overflow: hidden;
        font-weight: 400;
        vertical-align: middle;
    }

    tbody {
        tr {
            &:not(:last-child) {
                border-bottom: 1px solid ${({ theme }) => theme.colors.light2};
            }
            
            &:nth-of-type(odd) {
                background-color: ${({ theme }) => theme.colors.light};
            }
            
            &:hover, &:nth-of-type(odd):hover {
                background-color: ${({ theme }) => theme.colors.light3};
            }
            
            & > td {
                padding: 5px 7px;
            }
        }
    }    
`;

const StyledHeaderCell = styled.th`
    overflow: hidden;
    white-space: nowrap;
`;

const CenteredHeader = styled.span`
  width: 100%;
  display: flex;
  justify-content: center;
`

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
    filterTypes,
    rowStyle,
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
        <div>
            <StyledTable {...getTableProps()}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => {
                            const Header = column.render('Header');
                            const hasFilter = !disableFilters && !!column.Filter;
                            return (
                                <StyledHeaderCell
                                    width={column.width}
                                    {...column.getHeaderProps()}
                                >
                                    <CenteredHeader {...column.getSortByToggleProps()}>
                                        {Header}
                                        {column.isSorted && (column.isSortedDesc
                                                ? <FontAwesomeIcon icon="angle-down"/>
                                                : <FontAwesomeIcon icon="angle-up"/>
                                        )}
                                    </CenteredHeader>

                                    {hasFilter &&
                                    <div role="filter">{column.render('Filter')}</div>
                                    }
                                </StyledHeaderCell>
                            );
                        })}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {page.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()} style={rowStyle}>
                            {row.cells.map(cell => {
                                let cellProps = { ...cell.getCellProps() };
                                if (cell.column.cellProps)
                                    cellProps = { ...cellProps, ...cell.column.cellProps };
                                return (
                                    <StyledBodyCell {...cellProps} value={cell.value}>
                                        {cell.render('Cell')}
                                    </StyledBodyCell>
                                )
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </StyledTable>
            {showPagination && (
                <Pagination
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                    gotoPage={gotoPage}
                    nextPage={nextPage}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageOptions={pageOptions}
                    previousPage={previousPage}
                />
            )}
        </div>
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
    })),
    rowStyle: PropTypes.object,
}

Table.defaultProps = {
    /*
    filterTypes: {
        fame: fameFilterMethod,
    },
    */
    showPagination: false,
    disableFilters: false,
    pageSize: 10,
    sortBy: [],
    rowStyle: {}
}

export default withTheme(Table);
