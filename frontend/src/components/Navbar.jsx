import React, { useContext, useState } from 'react'

import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate=useNavigate();
    const [showMenu,setShowMenu]=useState(false);
    const {token,setToken,userData}=useContext(AppContext)
    const logout=()=>{
      setToken(false)
      localStorage.removeItem('token')
    }
  return (
    <div className='flex items-center justify-between py-4 text-sm mb-4 border-b border-b-gray-400'>
      <img src={assets.logo} className="w-44 cursor-pointer" onClick={()=>{navigate('/')}}/>
      <ul className='hidden md:flex gap-5 font-medium items-start'>
        <NavLink to="/">
            <li className='py-1'>HOME</li>
            <hr className='border-none outline-none h-0.5 w-3/5 bg-primary m-auto hidden'/>
        </NavLink>
        <NavLink to="/doctors">
            <li className='py-1'> ALL DOCTORS</li>
            <hr className='border-none outline-none h-0.5 w-3/5 bg-primary m-auto hidden'/>
        </NavLink>
        <NavLink to="/about">
            <li className='py-1'>ABOUT</li>
            <hr className='border-none outline-none h-0.5 w-3/5 bg-primary m-auto hidden'/>
        </NavLink>
        <NavLink to="/contact">
            <li className='py-1'>CONTACT</li>
            <hr className='border-none outline-none h-0.5 w-3/5 bg-primary m-auto hidden'/>
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
      <a href='https://doctor-appointment-admin-five.vercel.app/' target='_blank'><button className='border rounded-full border-gray-600 px-4 py-1 hover:bg-primary hover:text-white hover:border-primary'>Admin</button></a>
        {token && userData?<div className='flex items-center gap-2 cursor-pointer group relative'>
            <img src={userData.image} className='w-8 rounded-full' alt=""/>
            <img src={assets.dropdown_icon} className='w-2.5'/>
            <div className='absolute text-base top-0 right-0 pt-14 font-medium text-gray-600 z-20 hidden group-hover:block'>
                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                    <p className='hover:text-black cursor-pointer' onClick={()=>{navigate('/my-profile')}}>My Profile</p>
                    <p className='hover:text-black cursor-pointer' onClick={()=>{navigate('/my-appointments')}}>My Appoinments</p>
                    <p className='hover:text-black cursor-pointer' onClick={logout}>Logout</p>
                </div>
            </div>
        </div>:<><button onClick={()=>{navigate('/login')}} className='bg-primary px-8 py-3 text-white rounded-full font-light hidden md:block'>Create account</button>
        
               </>
        }
        <img onClick={()=>{setShowMenu(true)}} src={assets.menu_icon} alt="" className='w-6 md:hidden'/>
        {/* mobile menu */}
        <div className={`${showMenu?'fixed w-full':'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} alt="" className='w-36'/>
            <img onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" className='w-7'/>
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink to="/" onClick={()=>setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">HOME</p></NavLink>
            <NavLink to="/doctors" onClick={()=>setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p></NavLink>
            <NavLink to="/about" onClick={()=>setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">ABOUT</p></NavLink>
            <NavLink to="/contact" onClick={()=>setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">CONTACT</p></NavLink>
          </ul>
        </div>
      </div>
      
    </div>
  )
}

export default Navbar
