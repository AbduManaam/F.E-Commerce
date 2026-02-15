import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import Api from "../Api/Api";

export default function Profile() {
  const { user, logout, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await Api.get("/user/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setPasswordSuccess("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(result.message);
      }
    } catch (error) {
      setPasswordError("Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{profile?.name || user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{profile?.email || user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="text-lg capitalize">{profile?.role || user?.role}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className={`text-lg ${profile?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {profile?.isVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {passwordSuccess}
            </div>
          )}
          
          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-500 py-2 rounded-lg text-white hover:bg-indigo-600 transition"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}