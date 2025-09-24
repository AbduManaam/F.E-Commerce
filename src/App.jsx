import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Menu from './pages/Menu'
import AddressForm from './pages/AddressForm'
import MyOrder from './pages/MyOrder'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Cart from './pages/Cart'

const  App = () => {
  return (
   <main className="overflow-x-hidden text-textColor">
    <Header/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/menu" element={<Menu/>}/>
      <Route path="/blog" element={<Blog/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/addressform" element={<AddressForm/>}/>
      <Route path="/myorder" element={<MyOrder/>}/>
    </Routes>
    <Footer/>
   </main>
  )
}

export default  App

//  <div className="flex gap-12">
//       <button className="btn-solid">Solid</button>
//       <button className="btn-light">Light</button>
//       <button className="btn-outline">Outline</button>
//       <button className="btn-white">White</button>
//     </div>