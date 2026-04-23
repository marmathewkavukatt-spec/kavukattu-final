"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";

export default function ProfilePage() {
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setForm((f) => ({ ...f, email: data.email }));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validate passwords match
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Validate password length
    if (form.newPassword && form.newPassword.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      setError("Current password is required to set a new password");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully");
        setForm((f) => ({
          ...f,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-accent"></div>
          <p className="mt-4 text-sm text-stone-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <h1 className="mt-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-semibold text-stone-800">Profile Settings</h1>
      <p className="mt-2 text-base text-stone-600">Update your email and password</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6 rounded-xl border border-stone-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-stone-700">New Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          />
        </div>

        <div className="border-t border-stone-200 pt-6">
          <h3 className="font-serif font-medium text-stone-800">Change Password</h3>
          <p className="mt-1 text-sm text-stone-500">
            Leave blank to keep the current password
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Current Password</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            placeholder="Required before setting a new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            placeholder="At least 12 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Confirm New Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            placeholder="Re-enter new password"
          />
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-accent px-4 py-2 font-medium text-white hover:bg-accent/90 disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
