import { useEffect ,useRef  , useState } from 'react'
import './App.css'
import Peer from 'peerjs'



function VideoCall() {
    const websocket = new WebSocket("ws://localhost:3000")
    const PeerWF = useRef(null)
    const [myId,SetMyId] = useState("")


    useEffect(()=> {
    websocket.addEventListener("open",()=> {
        console.log("CLIENT:ONLINE")

        if (!myId) {return}

        websocket.send(JSON.stringify({type : "JoinCall",peer_id : myId}))



    },[])


    })


    useEffect(()=> {
        PeerWF.current = new Peer()

        PeerWF.current.on("open",(id)=> {
            SetMyId(id)
            console.log(id)
        })


        

        PeerWF.current.on("call",async(call)=> {
               const local_stream = await navigator.mediaDevices.getUserMedia({audio : true, video : true})
            document.getElementById("Local").srcObject = local_stream
            document.getElementById("Local").autoplay = true


              call.answer(local_stream)


        call.on("stream",(remoteStream)=> {
            document.getElementById("Remote").srcObject = remoteStream
            document.getElementById("Remote").autoplay = true

        })

      })




    },[])


      async function CallPeer(params) {
            const local_vid = await navigator.mediaDevices.getUserMedia({video : true, audio : true})
            document.getElementById("Local").srcObject = local_vid
            document.getElementById("Local").autoplay = true


            const response = await fetch("/GetRandomUser",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({peer_id : myId})
            })

            const data = await response.json()

            const Call = PeerWF.current.call(data.id["id"],local_vid)

            console.log("Selected",data.id["id"])


            Call.on("stream",(remotestream)=> {
                document.getElementById("Remote").srcObject = remotestream
                            document.getElementById("Remote").autoplay = true
            })


        }



    return (
        <div>
            <div className='LocalContainer'>
                <video id='Local'></video>
            </div>


            <div className='RemoteContainer'>
                <video id='Remote'></video>
            </div>


            <button onClick={CallPeer}>Join</button>
        </div>
    )

}

export default VideoCall