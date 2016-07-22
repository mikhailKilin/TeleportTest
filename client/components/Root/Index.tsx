import * as React from 'react'

interface IRootProps extends React.Props<Root>{

}

class Root extends React.Component<IRootProps,{}> {

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}
export default Root