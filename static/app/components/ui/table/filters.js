import React from "react";

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

export {
    DefaultColumnFilter,
    SelectColumnFilter
}