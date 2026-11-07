import { useState } from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import VideoCall from './VideoCall.jsx'
import { Routes , Route } from 'react-router'

function App() {
  const [page,setpage] = useState("MainPage")

  return (
    <div>

      <Routes>
        <Route path={"/"} element={<MainPage/>}></Route>
        <Route path={"/VideoCall"} element={<VideoCall/>}></Route>
      </Routes>

      

    </div>
  )
}

export default App
