import './App.css'
import './MainPage.css'
import { useNavigate } from 'react-router'


function MainPage() {
    const navigate = useNavigate()
    return (
        <div>



            <h1>FakeOmegle</h1>


            <div className='Container'>
                <button onClick={() => navigate("/VideoCall")}>Join</button>
            </div>
        </div>
    )
}


export default MainPage