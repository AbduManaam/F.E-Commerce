import React, { useEffect, useState } from "react";
import apiService from "../../service/api.service";
import { Eye, Edit, Ban, CheckCircle, Search, X } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 8;

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.client.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data :
       Array.isArray(res.data?.data) ? res.data.data :
      res.data.users || []);
    } catch { showMsg("error", "Failed to load users"); }
    finally { setLoading(false); }
  };

  const blockUser = async (id) => {
    try {
      await apiService.client.put(`/admin/users/${id}/block`);
      showMsg("success", "User blocked!");
      setUserToBlock(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to block user"); }
  };

  const unblockUser = async (id) => {
    try {
      await apiService.client.put(`/admin/users/${id}/unblock`);
      showMsg("success", "User unblocked!");
      setUserToUnblock(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to unblock user"); }
  };

  const handleSaveUser = async (u) => {
    try {
      const id = u.id || u.ID;
      await apiService.client.put(`/admin/users/${id}`, { name: u.name || u.Name,role: (u.role || u.Role || "USER").toUpperCase() });
      showMsg("success", "User updated!");
      setEditUser(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to update user"); }
  };

  const getStatus = (u) => {
    if (u.is_blocked || u.IsBlocked || u.blocked) return "Blocked";
    return u.status || u.Status || "Active";
  };

  const filtered = users.filter(u => {
    const name = (u.name || u.Name || "").toLowerCase();
    const email = (u.email || u.Email || "").toLowerCase();
    const status = getStatus(u);
    const matchSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status) => ({
    Active: "bg-green-100 text-green-700",
    Blocked: "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-600",
  }[status] || "bg-gray-100 text-gray-600");

  const activeCount = users.filter(u => getStatus(u) === "Active").length;
  const blockedCount = users.filter(u => getStatus(u) === "Blocked").length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">👥 Users</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search user..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, color: "text-indigo-600" },
          { label: "Active", value: activeCount, color: "text-green-600" },
          { label: "Blocked", value: blockedCount, color: "text-red-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
              <tr>
                {["User", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => {
                const id = u.id || u.ID;
                const status = getStatus(u);
                return (
                  <tr key={id} className="border-b hover:bg-indigo-50/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{u.name || u.Name}</p>
                      <p className="text-xs text-gray-500">{u.email || u.Email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs capitalize">
                        {u.role || u.Role || "customer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedUser(u)} title="View"
                          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setEditUser({ ...u })} title="Edit"
                          className="p-2 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                          <Edit size={15} />
                        </button>
                        {status === "Blocked" ? (
                          <button onClick={() => setUserToUnblock(u)} title="Unblock"
                            className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                            <CheckCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => setUserToBlock(u)} title="Block"
                            className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white border text-sm disabled:opacity-40 hover:bg-indigo-50">←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${page === currentPage ? "bg-indigo-500 text-white" : "bg-white border hover:bg-indigo-50"}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-white border text-sm disabled:opacity-40 hover:bg-indigo-50">→</button>
        </div>
      )}

      {/* View Modal */}
      {selectedUser && (
        <Modal title="User Details" onClose={() => setSelectedUser(null)}>
          <div className="space-y-3 text-sm">
            {[
              { label: "Name", value: selectedUser.name || selectedUser.Name },
              { label: "Email", value: selectedUser.email || selectedUser.Email },
              { label: "Role", value: selectedUser.role || selectedUser.Role || "customer" },
              { label: "Status", value: getStatus(selectedUser), badge: true },
              { label: "User ID", value: `#${selectedUser.id || selectedUser.ID}` },
            ].map((f, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-gray-500">{f.label}</span>
                {f.badge ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(f.value)}`}>{f.value}</span>
                ) : (
                  <span className="font-medium text-gray-800">{f.value}</span>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setSelectedUser(null)} className="mt-5 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium">Close</button>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={editUser.name || editUser.Name || ""} onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={editUser.email || editUser.Email || ""} onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
            </div> */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={editUser.role || editUser.Role || "USER"} 
                onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
            </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => handleSaveUser(editUser)} className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium">Save</button>
            <button onClick={() => setEditUser(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Block Modal */}
      {userToBlock && (
        <Modal title="Block User" onClose={() => setUserToBlock(null)}>
          <p className="text-gray-600 mb-5">Block <strong>{userToBlock.name || userToBlock.Name}</strong>? They won't be able to login until unblocked.</p>
          <div className="flex gap-3">
            <button onClick={() => setUserToBlock(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
            <button onClick={() => blockUser(userToBlock.id || userToBlock.ID)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Block</button>
          </div>
        </Modal>
      )}

      {/* Unblock Modal */}
      {userToUnblock && (
        <Modal title="Unblock User" onClose={() => setUserToUnblock(null)}>
          <p className="text-gray-600 mb-5">Unblock <strong>{userToUnblock.name || userToUnblock.Name}</strong>? They will be able to login again.</p>
          <div className="flex gap-3">
            <button onClick={() => setUserToUnblock(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
            <button onClick={() => unblockUser(userToUnblock.id || userToUnblock.ID)} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Unblock</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-gray-700" /></button>
      </div>
      {children}
    </div>
  </div>
);

export default UsersPage;