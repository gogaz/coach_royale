import React from 'react'

export default class Loading extends React.Component {
    render() {
        return (
            <div hidden={ !this.props.loading }>
                <div style={ {height: "50%"} }> </div>
                <img className="d-block mx-auto" src={ '/img/loading.svg' } />
            </div>
        );
    }
}
Loading.defaultProps = {loading: true};