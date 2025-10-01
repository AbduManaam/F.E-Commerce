import React from "react";
import UserRow from "./UserRow";

const UserTable = ({ users, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-slate-800">
      <table className="w-full text-left">
        <thead className="bg-slate-700 text-gray-300 uppercase text-sm">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Status</th>
            <th className="p-3">Orders</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <UserRow key={u.id} user={u} onDelete={onDelete} />
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-400">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
