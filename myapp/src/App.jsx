import { useState } from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import VideoCall from './VideoCall.jsx'

function App() {
  const [page,setpage] = useState("MainPage")

  return (
    <div>

      {page === "MainPage" && (<MainPage toVideoPage={()=> setpage("VideoCall")}/>)}
      {page === "VideoCall" && (<VideoCall toMainPage={() => setpage("MainPage")}/>)}
    </div>
  )
}

export default App
