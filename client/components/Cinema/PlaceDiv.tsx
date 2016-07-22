import * as React from 'react'
import {Place} from "./ClassHelper";

interface IPlaceProps {
    place: Place
    setReserve : any
}

class PlaceDiv extends React.Component<IPlaceProps,{}> {
    shouldComponentUpdate(nextProps:IPlaceProps, nextState:any) {
        if(nextProps.place == this.props.place){
            return false
        }
        return true
    }

    render() {
        return (
            <div style={{backgroundColor: this.props.place.color}}
                 onClick={() => this.props.setReserve(this.props.place.horizontalId,
                                                        this.props.place.verticalId)}
                 className="place flex-column-center-center"
            >
                <div>Hor: {this.props.place.horizontalId}</div>
                <div>Ver: {this.props.place.verticalId}</div>
            </div>
        )
    }
}
export default PlaceDiv