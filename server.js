import exp from "express"
import {exec} from "node:child_process"
import http from "http"
import path from "path"


import { fileURLToPath } from "node:url"

import SocketSetup from "./websocket.js"
import {SelectUserToCall}  from "./websocket.js"





const app = exp()
const server = http.createServer(app)
const PORT = 3000


SocketSetup(server)



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(exp.json())
app.use(exp.static(path.join(__dirname,"myapp/dist")))


app.post("/GetRandomUser",(req,res)=> {
    const {peer_id} = req.body

    const randomuser = SelectUserToCall(peer_id)

    res.json({id : randomuser})
})




app.get("/{*path}",(req,res)=> {
    res.sendFile(path.join(__dirname,"myapp/dist","index.html"))
})





exec("cd myapp && npm run build",(err)=> {
    if (err) {throw err}


    console.log("React successfully build")
})




server.listen(PORT,()=> console.log("localhost"),exec(`start http://localhost:${PORT}`))



