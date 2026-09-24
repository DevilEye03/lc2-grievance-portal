"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { ROLES } from "@/lib/validations";
import { formatDate } from "@/lib/sla";
import type { AdminUser } from "@/types";
import { Plus, Edit2, Trash2, ShieldCheck, Crown, Mail, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserTableProps {
  users: AdminUser[];
  currentUserId: string;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-brand-100 text-brand-800 border-brand-300",
  PRESIDENT: "bg-amber-100 text-amber-800 border-amber-300",
  DEPARTMENT_HEAD: "bg-purple-100 text-purple-800 border-purple-300",
  OFFICER: "bg-gray-100 text-gray-700 border-gray-300",
};

export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OFFICER");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setEditUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("OFFICER");
    setErrors({});
    setIsOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setErrors({});
    setIsOpen(true);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!editUser && password.length < 8) errs.password = "Password must be at least 8 characters";
    if (editUser && password && password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const body: Record<string, string> = { name, email, role };
      if (password) body.password = password;

      const url = editUser ? `/api/users/${editUser.id}` : "/api/users";
      const method = editUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", editUser ? "User updated." : "User created.");
        setIsOpen(false);
        router.refresh();
      } else {
        toast("error", data.error || "Operation failed.");
      }
    } catch {
      toast("error", "Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (user.id === currentUserId) {
      toast("warning", "You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user ${user.name}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("success", "User deleted.");
        router.refresh();
      } else {
        toast("error", data.error || "Delete failed.");
      }
    } catch {
      toast("error", "Network error.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* ─── Mobile Card List (sm:hidden) ─── */}
      <div className="sm:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    {user.id === currentUserId && (
                      <span className="text-[10px] text-brand-600 font-bold bg-brand-50 px-1.5 py-0.5 rounded">You</span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border mt-1 ${
                      roleColors[user.role] || "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {user.role === "SUPER_ADMIN" && <ShieldCheck className="h-3 w-3" />}
                    {user.role === "PRESIDENT" && <Crown className="h-3 w-3 text-amber-600" />}
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(user)} className="text-xs h-8 px-3">
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
              {user.id !== currentUserId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(user)}
                  className="text-xs h-8 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Desktop Table (hidden sm:block) ─── */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                Created
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.id === currentUserId && (
                        <span className="text-xs text-brand-600 font-medium">(You)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      roleColors[user.role] || "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {user.role === "SUPER_ADMIN" && <ShieldCheck className="h-3 w-3" />}
                    {user.role === "PRESIDENT" && <Crown className="h-3 w-3 text-amber-600" />}
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {user.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editUser ? "Edit User" : "Create New User"}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label={editUser ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder={editUser ? "••••••••" : "Min 8 characters"}
            required={!editUser}
          />
          <Select
            label="Role"
            options={ROLES}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto justify-center">
              {editUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
