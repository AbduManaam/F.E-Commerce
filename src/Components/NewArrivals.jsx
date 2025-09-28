// NewArrivals.jsx
import React, { useEffect, useState } from 'react';
import Title from './Title';
import { dummyProducts } from '../assets/data';
import Items from './items';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);


  useEffect(() => {
  const transformed = dummyProducts
    .filter((item) => item.inStock)
    .slice(0, 10)
    .map((p) => ({
      ...p,
      id: p._id || p.id, // normalize id
      price: typeof p.price === "number" ? { default: p.price } : p.price,
      sizes: p.sizes || (typeof p.price === "number" ? ["default"] : Object.keys(p.price)),
    }));
    
  setNewArrivals(transformed);
}, []);


  return (
    <section className="max-padd-containerr py-22 xl:py-45 bg-white">
      <Title title1="New" title2="Arrivals" titleStyles="pb-10" />

      <Swiper
        spaceBetween={30}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        breakpoints={{
          500: { slidesPerView: 2 },
          700: { slidesPerView: 3 },
          1022: { slidesPerView: 4 },
          1350: { slidesPerView: 5 },
        }}
        modules={[Autoplay]}
        className="min-h-[599px]"
      >
        {newArrivals.map((product) => (
          // important: flex center the slide and constrain width
          <SwiperSlide key={product._id} className="flex justify-center">
           <div className="w-full max-w-[380px] h-[550px] mx-auto">
              <Items product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default NewArrivals;

