import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Problems from './pages/Problems'
import Problem from './pages/Problem'
import Submission from './pages/Submission'
import Contests from './pages/Contests'
import Contest from './pages/Contest'
import CreateProblem from './pages/CreateProblem'
import CreateContest from './pages/CreateContest'
import User from './pages/User'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/problems"           element={<Problems />} />
          <Route path="/problems/new"       element={<CreateProblem />} />
          <Route path="/problems/:code"     element={<Problem />} />
          <Route path="/submissions/:id"    element={<Submission />} />
          <Route path="/contests"           element={<Contests />} />
          <Route path="/contests/new"       element={<CreateContest />} />
          <Route path="/contests/:id"       element={<Contest />} />
          <Route path="/users/:username"    element={<User />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
