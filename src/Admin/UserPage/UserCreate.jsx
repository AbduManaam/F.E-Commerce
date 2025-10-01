import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "Active",
    orders: 0,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/users", {
        ...form,
        id: "U" + Math.floor(Math.random() * 10000), // simple unique ID
      });
      navigate("/admin/users");
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Add New User</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md bg-slate-800 p-6 rounded-lg shadow-lg"
      >
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="p-2 rounded text-black"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="p-2 rounded text-black"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="p-2 rounded text-black"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <input
          type="number"
          name="orders"
          placeholder="Orders count"
          value={form.orders}
          onChange={handleChange}
          className="p-2 rounded text-black"
        />

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
