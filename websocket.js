import { WebSocketServer } from "ws";



const User_List = []




export default function SocketSetup(server) {

    const socketserver = new WebSocketServer({server})


    socketserver.on('connection',(ws)=> {
    console.log("connection on!")


    ws.on("message",(data)=> {
        const Data = JSON.parse(data)

        if (Data.type == "JoinCall") {

            if (!User_List.includes(Data.peer_id)) {
                User_List.push(Data.peer_id = {
                    id : Data.peer_id
                })
                console.log(User_List)
            }




        }


    })
})

}


export  function SelectUserToCall(peer_id) {
    const filteredlist = User_List.filter(user => user["id"] !== peer_id)


    const selectrandom = filteredlist[Math.floor(Math.random() * filteredlist.length)]


    return selectrandom
}


