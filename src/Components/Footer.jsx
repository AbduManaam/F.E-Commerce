import React from 'react'

const Footer = () => {
  return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 bg-white pt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
                    <div className="sm:col-span-2 lg:col-span-1">
                    <div className='flex flex-1'>
                        <img src="/images/other/logo.svg" className='h-18' alt="logo" />
                        <h2 className='pt-5 text-gray-700'>Yumzy</h2>
                    </div>
                       
                        <p className="text-sm/7 mt-6  text-gray-600">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat adipisci illo quod quas excepturi impedit pariatur tempore consequatur ratione, exercitationem at assumenda praesentium itaque natus iste corporis dolorem inventore vitae.</p>
                    </div>
                    <div className="flex flex-col lg:items-center lg:justify-center">
                        <div className="flex flex-col text-sm space-y-2.5">
                            <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                            <a className="hover:text-slate-700 transition" href="#">About us</a>
                            <a className="hover:text-slate-700 transition" href="#">Careers<span className="text-xs text-white bg-solid rounded-md ml-2 px-2 py-1">We’re hiring!</span></a>
                            <a className="hover:text-slate-700 transition" href="#">Contact us</a>
                            <a className="hover:text-slate-700 transition" href="#">Privacy policy</a>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-5">Subscribe to our newsletter</h2>
                        <div className="text-sm space-y-6 max-w-sm">
                            <p className=' text-gray-600'>The latest news, articles, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-indigo-50">
                                <input className="focus:ring-2 ring-indigo-600 outline-none w-full max-w-64 py-2 rounded px-2" type="email" placeholder="Enter your email" />
                                <button className="bg-solid px-4 py-2 text-white rounded">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="py-4 text-center border-t mt-6 border-slate-200">
                    Copyright 2025 © <a href="https://prebuiltui.com">PrebuiltUI</a> All Right Reserved.
                </p>
            </footer>
        </>
    );
}

export default Footer

