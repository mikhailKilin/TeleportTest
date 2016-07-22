import * as React from 'react'
import AppBar from 'material-ui/AppBar'
import { FlatButton, RaisedButton } from 'material-ui'
import  PlaceDiv from './PlaceDiv'
import * as request from 'superagent'
import {User, Place} from './ClassHelper'
import {SocketService} from '../../websocket/SocketService'
import messageTypes from '../../websocket/messageTypes'
import * as _ from 'lodash'
interface ICinemaState {
    user?:User
    isLoad?: boolean
    places?: Place[][]
    all_users?: any[]
}
class Cinema extends React.Component<{},ICinemaState> {
    exitButton: any
    form: HTMLFormElement
    horizontalCount: number
    verticalCount: number
    socketService: SocketService
    constructor(props){
        super(props)
        this.socketService = new SocketService(null, this.onMessage, null)
        console.log(this.socketService )
        this.horizontalCount = 5
        this.verticalCount = 5
        let places = []
        for(let i=0;i < this.horizontalCount ; i++){
            let horPlaces = []
            for(let j=0;j< this.verticalCount;j++){
                horPlaces.push(new Place(i,j,"", false))
            }
            places.push(horPlaces)
        }
        this.state = {user: null,
            isLoad: false,
            places: places
        }
        request.get('/api/user-info').end((err, res) => {
            if(err){
                console.log(err)
            } else {
                let usr = res.body.userInfo
                let all_users = res.body.all_users
                let places = res.body.places
                this.setState({
                    isLoad: true,
                    user: new User(usr.id, usr.login, usr.color),
                    all_users: all_users
                })
                for(let i=0;i< places.length;i++){
                    let place: any = places[i]
                    let colorUser = _.find(all_users, (user: any) => {
                        return user.id === place.user_id
                    })
                    this.setColor(place.horisontalNumber, place.verticalNumber, true, colorUser.color)
                }
            }
        })
        this.exitButton = (
                <div>
                    <RaisedButton label="Забронировать" onTouchTap={this.savePlaces}/>
                    <FlatButton label="Выйти" onTouchTap={this.logoutPost}/>
                </div>

        )
    }

    savePlaces = () => {
        request.post('/api/save-places').end((err,res) => {
            if(err){
                console.log(err)
            } else {
                console.log(res)
            }
        })
    }

    logoutPost = () => {
        this.form.submit()
    }

    setColor(horId, verId, reserve, color){
        let places = this.state.places
        places = [
            ...places.slice(0, horId),
            [
                ...places[horId].slice(0, verId),
                new Place(horId, verId, reserve ? color : null, reserve),
                ...places[horId].slice(verId + 1)
            ],
            ...places.slice(horId + 1)
        ]
        this.setState({
            places: places
        })
    }
    onMessage = (data: any) => {
        console.log(data)
        switch(data.type){
            case messageTypes.SET_RESERVE: {
                if(data.success){
                    this.setColor(data.place.horNumber,
                                    data.place.verNumber,
                                    data.place.reserve,
                                    data.place.color)
                    break
                }
            }
            case messageTypes.RESET_RESERVE:{
                console.log(data)
                data.data.forEach((item: any) => {
                    this.setColor(item.horisontalNumber, item.verticalnumber,false, "")
                })
                break
            }
        }

    }

    reservePlace(horId: number, verId: number){
        let places = this.state.places
        let reserve = !places[horId][verId].reserve
        console.log(reserve)
        this.socketService.send({
            type: messageTypes.SET_RESERVE,
            horId:horId,
            verId: verId,
            reserved: reserve
        })
    }
    renderPlaces(){
        return this.state.places.map((horPlaces: Place[]) => {
            return horPlaces.map((place: Place) => {
                return (
                    <PlaceDiv place={place} setReserve={(horId, verId) => this.reservePlace(horId, verId)} />
                )
            })
        })
    }
    render() {
        if(this.state.isLoad){
            return (
                <div>
                    <AppBar title={"Cinema: " + this.state.user.login}
                            showMenuIconButton={false}
                            iconElementRight={this.exitButton}
                            style={{
                                colour: this.state.user.color,
                                cursor: 'pointer'
                            }}
                    />
                    <form ref={container => this.form = container} action="/logout" method="post">
                    </form>
                    <div className="flex-center">
                        <div className="flex-row-space-around-center flex-wrap cinema">
                            {this.renderPlaces()}
                        </div>
                    </div>
                </div>
            )
        } else {
            return(
                <div>Loading...</div>
            )
        }
    }
}
export default Cinema