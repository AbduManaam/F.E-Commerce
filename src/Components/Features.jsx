
import React, { useState, useEffect } from "react";
import { FaTruck, FaLock, FaHeadset } from "react-icons/fa";
import jsonData from "../Json-Server/data.json";

// Map icons from JSON to React Icons
const iconsMap = {
  FaTruck: <FaTruck size={22} />,
  FaLock: <FaLock size={22} />,
  FaHeadset: <FaHeadset size={22} />,
};

const Features = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    setFeatures(jsonData.features); // Load features directly from JSON
  }, []);

  return (
    <section className="bg-pink-50 py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
        
        {/* LEFT: Features List */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            DISCOVER OUR{" "}
            <span className="text-orange-500">FOOD APP'S KEY FEATURES!</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Discover fresh foods that delight your taste, nourish your body,
            and bring joy to every meal.
          </p>

          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-start gap-4">
                <div className="bg-orange-500 text-white p-3 rounded-md">
                  {iconsMap[feature.icon]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Images Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Big left image */}
          <div className="bg-gray-200 rounded-xl overflow-hidden col-span-1 row-span-2">
            <img
              src="/images/other/features1.png"
              alt="food"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top-right small image */}
          <div className="bg-gray-200 rounded-xl overflow-hidden">
            <img
              src="/images/other/features2.png"
              alt="food"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom-right small image */}
          <div className="bg-gray-200 rounded-xl overflow-hidden">
            <img
              src="/images/other/features3.png"
              alt="food"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;








