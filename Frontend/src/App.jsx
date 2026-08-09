import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login'
import Singup from './Singup'
import Header from './Header'
import Home from './Home'
import Preotectedroute from './Preotectedroute'

function App() {
  return (
    <BrowserRouter>
    <Header/>
    <Routes>
      <Route path='/' element={<Preotectedroute><Home/></Preotectedroute>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/singup' element={<Singup/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App