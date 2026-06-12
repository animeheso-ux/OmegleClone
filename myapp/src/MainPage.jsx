import './App.css'
import './MainPage.css'


function MainPage({toVideoPage}) {
    return (
        <div>



            <h1>FakeOmegle</h1>


            <div className='Container'>
                <button onClick={toVideoPage}>Join</button>
            </div>
        </div>
    )
}


export default MainPage