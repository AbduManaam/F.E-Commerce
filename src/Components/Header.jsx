import React, { useState } from 'react'
import { Link,useLocation } from 'react-router-dom'
import { assets } from '../assets/data'
import NavBar from './NavBar'

const Header = () => {

  const [menuOpened, setmenuOpened] = useState(false);

  const toggleMenu=()=> setmenuOpened(prev=> !prev);

  return (
   <header className='absolute top-0 left-0 right-0 z-50 py-3'>
    {/* CONTAINER */}
    <div className='max-padd-container flexBetween'>
      {/* LOgo */}
        <div className='flex flex-1'>
            <Link to={"/"} className='flex items-end'>
            <img src={assets.logoImg} alt="logo" className='h-12' />       
        <div>
            <span className='hidden sm:block font-extrabold text-3xl
            relative top-0 left-1 '>Yumzy</span>
        </div>
        </Link>
        </div>
       
        {/* Nav */}
       <div className='flexCenter flex-1 items-center sm:justify-end gap-x-4 sm:gap-x-8'>
         <NavBar setmenuOpened={setmenuOpened} c containerStyles={`${
    menuOpened
      ? "flex items-start flex-col gap-y-8 fixed top-16 right-6 p-5 bg-white shadow-md w-52 ring-1 ring-slate-900/5 z-50"
      : "hidden lg:flex gap-x-5 xl:gap-x-12 medium-15 p-1"
  }`}/>
       </div>
       {/* Butn & Profile */}
       <div className='flex flex-1'>
        {/* Menu Toggle */}
        <div className='relative lg:hidden w-7 h-6 '>
         <img onClick={toggleMenu} src={assets.menu} alt="" className={`absolute inset-0 
          lg:hidden cursor-pointer transition-opacity duration-700 ${menuOpened ? "opacity-0" : "opacity-100"}`} />
         <img onClick={toggleMenu} src={assets.menuClose} alt="" className={`absolute inset-0 
          lg:hidden cursor-pointer transition-opacity duration-700 ${menuOpened ? "opacity-100" : "opacity-0"}`} />
        </div>
        {/* Cart */}
        <div className='relative cursor-pointer'>
          <img src={assets.cartAdded} alt="" className='min-w-11 bg-white rounded-full p-2' />
          <label     className="absolute bottom-10 right-1 text-xs font-bold bg-solid text-white flexCenter rounded-full w-9"
          >0</label>
        </div>
        {/* UserProfile */}
        <div>
            <button className='btn-solid flexCenter gap-2'>
          Login
        <img src={assets.user} alt="" className='invert w-5' />
        </button>
        </div>
     
       </div>
    </div>
   </header>
  )
}

export default Header