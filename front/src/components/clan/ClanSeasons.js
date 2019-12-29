import React, { useState } from 'react'
import ClanMembersTable from "./ClanMembersTable";
import TrophiesCell from "./cells/TrophiesCell";
import moment from "moment";
import ErrorBoundary from "../errors/ErrorBoundary";

const ClanSeasons = ({endpoint}) => {
    const [previousSeason, setPreviousSeason] = useState(null);

    return (
        <div className="card-body row">
            <div className="col-md-6 mt-2 h-100">
                <div className="card">
                    <div className="card-header"><h4>Previous week</h4></div>
                    <ErrorBoundary>
                        <ClanMembersTable
                            endpoint={ endpoint + '/weekly' }
                            baseColumns={ ['name', 'trophies', 'given'] }
                            defaultSorted={ [{ id: "given", desc: true }] }
                            showPagination={ true }
                        />
                    </ErrorBoundary>
                </div>
            </div>
            <div className="col-md-6 mt-2 h-100">
                <div className="card">
                    <div className="card-header"><h4>Previous Season{ previousSeason && ` (${ previousSeason.format('MMM YYYY') })` }</h4></div>
                    <ErrorBoundary>
                        <ClanMembersTable
                            endpoint={ endpoint + '/season' }
                            baseColumns={ ['name'] }
                            columns={ [
                                {
                                    Header: "Trophies",
                                    accessor: "details.ending",
                                    width: 90,
                                    Cell: ({ row, original }) => <TrophiesCell trophies={ original.details.ending } arena={ original.details.arena }/>
                                },
                                {
                                    Header: "Highest",
                                    accessor: "details.highest",
                                    width: 90,
                                    Cell: ({ row, original }) => <TrophiesCell trophies={ original.details.highest }/>
                                },
                            ] }
                            defaultSorted={ [{ id: "details.ending", desc: true }] }
                            onFetchData={ (data) => setPreviousSeason(moment(data[0].details.season__identifier + '-01', 'YYYY-MM-DD')) }
                            showPagination={ true }
                        />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    )
};

export default ClanSeasons;