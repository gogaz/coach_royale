import React from 'react';
import ReactTable from "react-table";

export default class TournamentsTable extends React.Component {
    render() {
        const {data, loading, resizable, pageSize} = this.props;
        return (
            <ReactTable
                data={data}
                loading={loading}
                resizable={resizable}
                pageSize={pageSize}
                columns={[
                    {
                        Header: "Name",
                        accessor: "name"
                    },
                    {
                        Header: "Players",
                        accessor: 'current_players'
                    },
                    {
                        Header: "status",
                        accessor: "status"
                    }
                ]}
            />
        );
    }
}
TournamentsTable.defaultProps = {data: [], loading: true, resizable: false, pageSize: 50};