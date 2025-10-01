import React from "react";

const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by name or email..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-6 px-4 py-2 w-full md:w-1/2 rounded-lg bg-slate-700 text-white placeholder-gray-400"
    />
  );
};

export default SearchBar;
