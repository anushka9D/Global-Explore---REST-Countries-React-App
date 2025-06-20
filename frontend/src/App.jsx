import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import HomeUser from './components/HomeUser'
import SignUp from './components/SignUp'
import User from './components/User'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomeUser />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign_up" element={<SignUp />} />
        <Route path="/profile" element={<User />} />
      </Routes>
    </Router>
  )
}

export default App;