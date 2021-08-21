import React from 'react'
import ReactTooltip from "react-tooltip";

import moment from 'utils/moment'
import {useAutoFetch} from "hooks/useAxios";
import Loading from "components/ui/Loading";
import {Card, Header as CardHeader} from "components/ui/Card";
import FontAwesomeIcon from "components/ui/FontAwesome";
import Table from "components/ui/table/Table";
import {Grid} from "components/ui/Disposition";
import {Link} from "react-router-dom";
import {CLAN_ROLES} from "../../utils/constants";
import CriticalError from "../errors/CriticalError";

const getRowValue = (row, column) => column.accessor(row.original)

const cellByValueType = {
    int: ({ row, column }) => Number(getRowValue(row, column)).toLocaleString(),
    datetime: ({ row, column }) => moment(getRowValue(row, column)).short(),
    str: ({ row, column }) => column.accessor(row),
}

const GoalRule = ({ goal }) => {
    const tooltipId = `goal-${goal.id}-rules`
    const {rules, matching_players: players} = goal

    const humanize = (str) => {
        return str
            .replace(/^[\s_]+|[\s_]+$/g, '')
            .replace(/[_\s]+/g, ' ')
            .replace(/^[a-z]/, function(m) { return m.toUpperCase(); });
    }

    const goalColumns = rules.map((rule) => ({
        Header: humanize(rule.field),
        id: rule.field,
        Cell: cellByValueType[rule.filtered_column_type],
        accessor: rule.field,
        width: 50,
    }))
    return (
        <Card>
            {goal.name && (
                <CardHeader>
                    <h4 style={{margin: 0}}>
                        {goal.name}
                        <FontAwesomeIcon icon="question-circle" size="1.25rem" data-tip data-for={tooltipId} />
                    </h4>

                    <ReactTooltip place="top" type="dark" effect="solid" id={tooltipId}>
                        {goal.applies_to && goal.applies_to.length && (
                            `Applies to ${goal.applies_to.map(role => CLAN_ROLES[role] + 's').join(', ')}`
                        )}
                        <ul style={{margin: 0, paddingInlineStart: '30px'}}>
                            {rules.map((rule, index) => (
                                <li key={`rule-${rule.id}`}>
                                    {index !== 0 && 'OR'} {rule.description}
                                </li>
                            ))}
                        </ul>
                    </ReactTooltip>
                </CardHeader>
            )}

            {goal.description && <small className="text-muted">{goal.description}</small>}

            {!players.length && (
                <CriticalError
                    code={null}
                    message="No players"
                    description="There are no players matching these criterion"
                />
            )}
            {players.length && (
                <Table
                    data={players}
                    initialPageSize={10}
                    showPagination
                    sortBy={rules.map((rule) => ({ id: rule.field, }))}
                    columns={[
                        {
                            Header: "Player",
                            id: 'name',
                            accessor: "name",
                            Cell: ({ row }) => (
                                <>
                                    <Link to={ "/player/" + row.original.tag }>{ row.values.name }</Link>
                                    &nbsp;
                                    <span className="small text-muted">(#{row.original.current_clan_rank})</span>
                                    <div className="small text-muted">#{row.original.tag}</div>
                                </>
                            )
                        },
                        {
                            Header: "Role",
                            id: "role",
                            accessor: 'clan_role',
                            Cell: ({ row }) => CLAN_ROLES[row.values.role],
                            width: 30,
                        },
                        ...goalColumns
                    ]}
                />
            )}
        </Card>
    )
}

const ClanRuleMatcher = ({endpoint,}) => {
    const {response: data, loading} = useAutoFetch(endpoint + '/player_goal_rules', []);

    if (loading)
        return <Loading/>

    if (!data.length)
        return <CriticalError code={null} description="No data" message="There are no reports yet." />

    return (
        <Grid columns={ { sm: 1, md: 2 } } style={ { padding: '1.25rem' } } gap="20px">
            {data.map((goal) => <GoalRule key={goal.id} goal={goal} />)}
        </Grid>
    )
}

export default ClanRuleMatcher
