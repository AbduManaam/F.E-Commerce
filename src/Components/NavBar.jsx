import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = ({containerStyles,setmenuOpened}) => {

    const navLinks = [
    { path: '/', title: 'Home' },
    { path: '/menu', title: 'Menu' },
    { path: '/blog', title: 'Blog' },
    { path: '/contact', title: 'Contact' }
  ]

  return (
    <nav className={containerStyles}>
    {navLinks.map((links)=>(
      <NavLink
      onClick={()=> setmenuOpened(false)}
      key={links.title}
      to={links.path}
      className={({isActive})=> `${isActive ? "active-link": ""} px-3 py-2
      rounded-full uppercase text-sm font-bold`}
      >

      {links.title}
      </NavLink>

    ))}
    </nav>
  )
}

export default NavBar