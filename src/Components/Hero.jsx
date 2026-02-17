// import React from 'react'
// import Rating from './Rating'

// const Hero = () => {
//   return (
//    <section className='max-padd-container'>
//      <div className="lg:bg-[url('/src/assets/bg.png')] bg-cover bg-center 
//            bg-no-repeat h-screen w-full rounded-2xl relative">
//            {/* CONTAINER */}
//            <div className="mx-auto max-w-[1440px] px-4 flex flex-col justify-between h-full">
//                 {/* TOP */}
//                 <div className='max-w-[788px] pt-44 lg:pt-58'>
//                   <h3>Delicious Meals for Every Craving</h3>
//                   <h2 className='uppercase !mb-0 tracking-[0.22rem]'>
//                     <span className='text-solidOne'>Enjoy </span>
//                     <span className='text-solidTwo'>25% Off Today!</span>
//                   </h2>
//                   <h1 className='font-[800] leading-none'>On Rice & Curry </h1>
//                   <div className='flex items-center'>
//                    <h3>Starting From</h3>
//                   <span className='bg-white p-1 inline-block rotate-[-2deg] ml-2.5 text-5xl font-extrabold'>
                  
//                   <span className='text-2xl relative bottom-3'>$</span>04.
//                  <span className='text-2xl'>99</span>
//                  </span>
//                 </div>
                           
//                <p className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white 
//                  rounded-lg px-6 py-3 text-2xl font-bold mt-8 shadow-lg">
//                  Shop Now
//               </p>

//                 </div>
//                 {/* BOTTOM */}
//                 <div className="pb-9"></div> 
//                 <Rating/>
//            </div>
//      </div>
//    </section>
//   )
// }

// export default Hero


//----------------------------------------------------------------------------------------------------------


// import React from 'react'
// import Rating from '../Components/Rating'

// const Hero = ({ hero }) => {
//   if (!hero) return null;

//   return (
//    <section className='max-padd-container'>
//      <div
//        className="bg-cover bg-center bg-no-repeat h-screen w-full rounded-2xl relative"
//        style={{
//          backgroundImage: hero.background_image
//            ? `url(${hero.background_image})`
//            : "url('/src/assets/bg.png')",
//        }}
//      >
//            <div className="mx-auto max-w-[1440px] px-4 flex flex-col justify-between h-full">
//                 <div className='max-w-[788px] pt-44 lg:pt-58'>
//                   <h3>{hero.subtitle}</h3>

//                   <h2 className='uppercase !mb-0 tracking-[0.22rem]'>
//                     <span className='text-solidOne'>{hero.highlight1} </span>
//                     <span className='text-solidTwo'>{hero.highlight2}</span>
//                   </h2>

//                   <h1 className='font-[800] leading-none'>
//                     {hero.title}
//                   </h1>

//                   <div className='flex items-center'>
//                    <h3>Starting From</h3>
//                   <span className='bg-white p-1 inline-block rotate-[-2deg] ml-2.5 text-5xl font-extrabold'>
//                   <span className='text-2xl relative bottom-3'>$</span>
//                   {hero.price}
//                  </span>
//                 </div>

//                <p className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white 
//                  rounded-lg px-6 py-3 text-2xl font-bold mt-8 shadow-lg">
//                  {hero.button_text || "Shop Now"}
//               </p>

//                 </div>

//                 <div className="pb-9"></div> 
//                 <Rating/>
//            </div>
//      </div>
//    </section>
//   )
// }

// export default Hero






//----------------------------------------------------------------------------------------------------------





import React from 'react';
import Rating from '../Components/Rating';

const Hero = ({ hero }) => {

  if (!hero) {
    return <div className="text-center py-20">No hero data</div>;
  }

  return (
    <section className='max-padd-container'>
      <div
        className="bg-cover bg-center bg-no-repeat h-screen w-full rounded-2xl relative"
        style={{
          backgroundImage: hero.background_image
            ? `url(${hero.background_image})`
            : "url('/src/assets/bg.png')",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 flex flex-col justify-between h-full">
          <div className='max-w-[788px] pt-44 lg:pt-58'>
            <h3>{hero.subtitle}</h3>

            <h2 className='uppercase !mb-0 tracking-[0.22rem]'>
              <span className='text-solidOne'>{hero.highlight1} </span>
              <span className='text-solidTwo'>{hero.highlight2}</span>
            </h2>

            <h1 className='font-[800] leading-none'>
              {hero.title}
            </h1>

            <div className='flex items-center'>
              <h3>Starting From</h3>
              <span className='bg-white p-1 inline-block rotate-[-2deg] ml-2.5 text-5xl font-extrabold'>
                <span className='text-2xl relative bottom-3'>$</span>
                {hero.price}
              </span>
            </div>

            <p className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white 
              rounded-lg px-6 py-3 text-2xl font-bold mt-8 shadow-lg">
              {hero.button_text || "Shop Now"}
            </p>
          </div>

          <div className="pb-9"></div>
          <Rating />
        </div>
      </div>
    </section>
  );
};

export default Hero;
