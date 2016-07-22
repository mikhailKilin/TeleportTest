export class SocketService {
    ws: any
    send(data){
        if(typeof data !== 'object'){
            console.log('You must send object!')
        } else {
            this.ws.send(JSON.stringify(data))
        }
    }
    init = (cb_on_open,cb_on_message, cb_on_close) => {
        let port = location.port ? ':' + location.port : ''
        this.ws = new WebSocket(`ws://${window.location.hostname}${port}/websockets`)

        this.ws.onopen = () => {
            console.log('ws open')
            if(cb_on_open){
                cb_on_open()
            }
        }
        this.ws.onclose = () => {
            console.log('ws close')
            if(cb_on_close){
                cb_on_close()
            }
        }
        this.ws.onmessage = (message, all_info = false) => {
            if(!all_info){
                let data = JSON.parse(message.data)
                cb_on_message(data)
            } else {
                cb_on_message(message)
            }
        }
    }
    constructor(cb_on_open,cb_on_message, cb_on_close) {
        this.init(cb_on_open,cb_on_message, cb_on_close)
    }
}