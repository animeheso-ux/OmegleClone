import { WebSocketServer } from "ws";



export let User_List = new Map()
export let single_calls = new Map()
export let group_calls = new Map()



export default function SocketSetup(server) {

    const socketserver = new WebSocketServer({ server })


    socketserver.on('connection', (ws) => {
        console.log("connection on!")

        ws.on("close", () => {
            if (User_List.has(ws)) {
                User_List.delete(ws)
                console.log("removed user")

                if (single_calls.has(ws)) {
                    single_calls.delete(ws)
                }
                if (group_calls.has(ws)) {
                    group_calls.delete(ws)
                }
            }
        })

        ws.on("message", (data) => {
            const Data = JSON.parse(data)

            if (Data.type == "addUser") {

                if (!User_List.has(ws)) {
                    User_List.set(ws, { id: Data.id, socket: ws, busy: false, callType: "" })
                }

            }

            if (Data.type == "joinCall") {
                if (User_List.has(ws)) {
                    User_List.get(ws).callType = Data.call_type

                    if (Data.call_type == "single") {
                        if (!single_calls.has(ws)) {
                            single_calls.set(ws,
                                { id: User_List.get(ws).id, socket: ws }
                            )
                            const getUsers =  [...single_calls.values()]
                            
                            getUsers.map((user) => {
                                user["socket"].send(JSON.stringify({ type: "getPeers", otherPeers: getUsers, id : user["id"]}))
                            })
                        }
                    } else {
                        if (!group_calls.has(ws)) {
                            group_calls.set(ws,
                                { id: User_List.get(ws).id, socket: ws }
                            )
                        }
                    }


                }

            }

            if (Data.type == "sendCandidate") {
                const targetUser = [...User_List.values()].find(user => user["id"] == Data.target)
                targetUser["socket"].send(JSON.stringify({ type: "receiveCandidate", candidate : Data.candidate ,sender : Data.sender}))
            }

            if (Data.type == "sendOffer") {
                console.log(Data.target)
                const targetUser = [...User_List.values()].find(user => user["id"] == Data.target)

                if (targetUser["busy"] !== true) {
                    targetUser["socket"].send(JSON.stringify({ type: "receiveOffer", offer: Data.offer, sender: Data.sender }))
                }
            }

            if (Data.type == "sendAnswer") {
                const targetUser = [...User_List.values()].find(user => user["id"] == Data.target)

                if (targetUser["busy"] !== true) {
                    targetUser["busy"] = true
                    targetUser["socket"].send(JSON.stringify({ type: "receiveAnswer",answer : Data.answer, sender: Data.sender }))
                }
            }




        })
    })

}



