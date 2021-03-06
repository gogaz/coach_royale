import React from 'react'
import { withTheme } from 'styled-components'

// Basic string search
const DefaultColumnFilter = ({ column: { filterValue, setFilter }, }) => (
    <input
        value={ filterValue || '' }
        onChange={ e => {
            setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
        } }
    />
)

// id is the id of the column we are filtering
function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set()
        preFilteredRows.forEach(row => {
            options.add(row.values[id])
        })
        return [...options.values()]
    }, [id, preFilteredRows])

    // Render a multi-select box
    return (
        <select
            value={ filterValue }
            onChange={ e => {
                setFilter(e.target.value || undefined)
            } }
        >
            <option value="">All</option>
            { options.map((option, i) => (
                <option key={ i } value={ option }>
                    { option }
                </option>
            )) }
        </select>
    )
}

/*
 Unused as of September 2020 update

const winRateFilterMethod = (rows, id, filterValue) => {
    if (filterValue === "all")
        return rows;
    else if (filterValue === "grey")
        return rows.filter(row => row.values[id] < 0);
    else if (filterValue === "red")
        return rows.filter(row => row.values[id] < 50 && row.values[id] >= 0);
    return rows.filter(row => row.values[id] >= 50);
};
winRateFilterMethod.autoRemove = val => !val
*/

export {
    DefaultColumnFilter,
    SelectColumnFilter,
}