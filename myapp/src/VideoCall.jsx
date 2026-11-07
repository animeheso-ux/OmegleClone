import { useEffect, useRef, useState } from 'react'
import './App.css'

export default function VideoCall() {
    const websocketREF = useRef(null)
    const [userId, setUserId] = useState("")
    const [peerList, setPeerList] = useState([])
    const [remoteStreams, setRemoteStreams] = useState([])
    const [incall, setInCall] = useState(false)

    const localVideoREF = useRef(null)
    const peerListREF = useRef([])
    const idREF = useRef("")

    function getPeers() {

    }

    function joinSingle() {

        websocketREF.current.send(JSON.stringify({ type: "joinCall", call_type: "single" }))
    }

    function joinGroup() {
        websocketREF.current.send(JSON.stringify({ type: "joinCall", call_type: "group" }))
    }

    function GenerateRandomId() {
        let id = "";
        for (let i = 0; i < 5; i++) {
            const randomnum = Math.floor(Math.random() * 9).toString()
            id += randomnum
        }

        return id
    }

    useEffect(() => {
        const websocket = new WebSocket("ws://localhost:3000")

        websocketREF.current = websocket

        websocket.addEventListener("open", () => {
            console.log("CLIENT : OPEN!")
            const randomid = GenerateRandomId()
            setUserId(randomid)
            idREF.current = randomid

            websocket.send(JSON.stringify({ type: "addUser", id: randomid }))
        })

        websocket.addEventListener("message", async (e) => {
            const Data = JSON.parse(e.data)

            if (Data.type == "getPeers") {
                const PeerArray = []
                const otherPeers = Data.otherPeers.filter(user => user["id"] !== idREF.current && user["busy"] !== true)

                const devices = await navigator.mediaDevices.enumerateDevices()
                const camera = devices.filter(device => device.kind == "videoinput" && device.label == "Integrated Camera (30c9:00ac)")
                

                const microphone = devices.filter(device => device.kind == "audioinput" && device.label == "Microphone Array (Realtek(R) Audio)")


                const stream = await navigator.mediaDevices.getUserMedia({ video: {deviceId : {exact : camera[0].deviceId}}, audio: {deviceId : { exact : microphone[0].deviceId }} })


                localVideoREF.current.srcObject = stream

                otherPeers.forEach(user => {
                    const peer = new RTCPeerConnection({
                        iceServers: [
                            { urls: "stun:stun4.l.google.com:19302" },
                            // {
                            //     urls: "turn:free.expressturn.com:3478",
                            //     username: data.username,
                            //     credential: data.password
                            // }

                        ],
                        //iceTransportPolicy: "relay"
                    })

                    const dc = peer.createDataChannel("channel")

                    dc.onopen = () => {
                        console.log("data channel connected")
                    }

                    peer.onicecandidate = (e) => {
                        //send ice candidate to other users
                        console.log("ICE CANDIDATE!!")
                        if (e.candidate) {
                            websocket.send(JSON.stringify({ type: "sendCandidate", candidate: e.candidate, callType: user["callType"], sender: idREF.current, target: user["id"] }))
                        }

                    }

                    stream.getTracks().forEach(track => {
                        peer.addTrack(track, stream)
                    })


                    peer.ontrack = (e) => {
                        const remoteStream = e.streams[0]

                        console.log("Track kind:", e.track.kind)
                        console.log("Streams:", e.streams)
                        console.log("Stream:", e.streams[0])

                        setRemoteStreams(prev => {
                            if (prev.some(s => s.id == remoteStream.id)) {
                                return prev
                            }
                            return [...prev, remoteStream]
                        })
                    }

                    PeerArray.push({ peerObject: peer, id: user["id"] })
                });

                setPeerList(PeerArray)
                peerListREF.current = PeerArray

                PeerArray.map(async (peer) => {
                    const offer = await peer["peerObject"].createOffer()
                    await peer["peerObject"].setLocalDescription(offer)
                    websocket.send(JSON.stringify({ type: "sendOffer", offer: offer, sender: idREF.current, target: peer["id"] }))
                })
            }

            if (Data.type == "receiveCandidate") {
                //console.log("candidate received", Data.sender)
                const sendersPeer = peerListREF.current.find(peer => peer["id"] == Data.sender)

                if (sendersPeer) {
                    //console.log("candidate", Data.candidate)
                    await sendersPeer["peerObject"].addIceCandidate(Data.candidate)
                }
            }

            if (Data.type == "receiveOffer") {
                console.log(Data.sender)
                const sendersPeer = peerListREF.current.find(peer => peer["id"] == Data.sender)
                console.log(sendersPeer)

                if (sendersPeer) {
                    await sendersPeer["peerObject"].setRemoteDescription(Data.offer)
                    const answer = await sendersPeer["peerObject"].createAnswer()
                    await sendersPeer["peerObject"].setLocalDescription(answer)

                    websocket.send(JSON.stringify({ type: "sendAnswer", answer: answer, sender: idREF.current, target: Data.sender }))
                }
            }

            if (Data.type == "receiveAnswer") {
                console.log("answer received", Data.sender)
                const sendersPeer = peerListREF.current.find(peer => peer["id"] == Data.sender)

                if (sendersPeer && !sendersPeer["peerObject"].remoteDescription) {
                    await sendersPeer["peerObject"].setRemoteDescription(Data.answer)
                }

            }
        })

    }, [])

    return (
        <>
            <h1>Your ID : {userId}</h1>

            {incall ? (
                <>
                    <video ref={localVideoREF} autoPlay playsInline muted></video>
                    {remoteStreams.map((stream, index) => (
                        <video
                            autoPlay
                            playsInline
                            ref={(video) => {
                                if (video) {
                                    video.srcObject = stream

                                    console.log("Video srcObject:", video.srcObject)
                                    console.log("Video tracks:", video.srcObject.getTracks())
                                    console.log("Video tracks only:", video.srcObject.getVideoTracks())
                                }
                            }}
                        />
                    ))}
                    <div>
                        <button>Mute</button>
                        <button>Mute all</button>
                        <button>Leave call</button>
                    </div>
                </>
            ) : (
                <>
                    <button onClick={() => { setInCall(true), joinSingle() }}>Single Call</button>
                    <button onClick={() => { setInCall(true), joinGroup() }} >Group calls</button>
                </>
            )}
        </>
    )
}