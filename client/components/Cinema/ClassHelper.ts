'use strict'
export class User {
    id:number
    login:string
    color: string
    constructor(id: number, login: string, color: string){
        this.id = id
        this.login = login
        this.color = color
    }
}
export class Place {
    horizontalId: number
    verticalId: number
    color: string
    reserve: boolean
    constructor(horId: number, verId: number, color: string, res: boolean){
        this.horizontalId = horId
        this.verticalId = verId
        this.color = color
        this.reserve = res
    }
}