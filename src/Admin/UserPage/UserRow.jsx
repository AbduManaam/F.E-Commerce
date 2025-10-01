import React from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UserRow = ({ user, onDelete }) => {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-slate-700 hover:bg-slate-700/50 transition">
      <td className="p-3">
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </td>
      <td className="p-3">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            user.status === "Active"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="p-3">{user.orders}</td>
      <td className="p-3 flex gap-3">
        <button
          onClick={() => navigate(`/admin/users/${user.id}`)}
          className="text-blue-400 hover:text-blue-600"
        >
          <FiEye size={18} />
        </button>
        <button
          onClick={() => navigate(`/admin/users/edit/${user.id}`)}
          className="text-yellow-400 hover:text-yellow-600"
        >
          <FiEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="text-red-400 hover:text-red-600"
        >
          <FiTrash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
