import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", status: "Active", orders: 0 });

  useEffect(() => {
    axios.get(`http://localhost:5000/users/${id}`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/users/${id}`, form);
    navigate("/admin/users");
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input name="name" value={form.name} onChange={handleChange} className="p-2 rounded text-black" />
        <input name="email" value={form.email} onChange={handleChange} className="p-2 rounded text-black" />
        <select name="status" value={form.status} onChange={handleChange} className="p-2 rounded text-black">
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <input
          name="orders"
          type="number"
          value={form.orders}
          onChange={handleChange}
          className="p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
};

export default UserEdit;
