import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api";
import { toast } from "react-toastify";
import { FaCamera, FaTrash, FaUser } from "react-icons/fa";
import { login } from "../store/store";

const API_BASE = "http://localhost:5000";

export default function ProfilePhotoUpload({ size = 80 }) {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const photoUrl = preview
    ? preview
    : user?.profile_photo
    ? `${API_BASE}${user.profile_photo}`
    : null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      return toast.error("Only JPG, PNG, or WEBP images are allowed");
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be under 2MB");
    }

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setLoading(true);
      const res = await api.post("/profile/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update redux store + localStorage so it persists
      const updatedUser = { ...user, profile_photo: res.data.profile_photo };
      dispatch(login({ token, user: updatedUser }));

      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await api.delete("/profile/remove");
      const updatedUser = { ...user, profile_photo: null };
      dispatch(login({ token, user: updatedUser }));
      setPreview(null);
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error("Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold" style={{ fontSize: size / 2.5 }}>
              {user?.name?.[0]?.toUpperCase() || <FaUser />}
            </span>
          )}
        </div>

        {/* Camera overlay button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Change photo"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 transition-transform group-hover:scale-110 disabled:opacity-60"
        >
          {loading ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <FaCamera size={12} />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {photoUrl && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-60"
        >
          <FaTrash size={10} /> Remove photo
        </button>
      )}

      <p className="text-[11px] text-gray-400 text-center">JPG, PNG or WEBP. Max 2MB.</p>
    </div>
  );
}