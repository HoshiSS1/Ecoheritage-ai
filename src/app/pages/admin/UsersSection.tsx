import { useState, useEffect } from "react";
import { Users, Mail, Clock, UserPlus, Shield, Trash2, Ban, CheckCircle2, Search, ExternalLink } from "lucide-react";
import { shellCardClass, formatDateTime } from "./adminUtils";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";
import { getAvatarUrl } from "../../utils/avatarUtils";

export type UserRole = "Super Admin" | "Content Editor" | "Moderator" | "Member";

interface UserRecord {
  name: string;
  email: string;
  password: string;
  provider?: "email" | "google";
  createdAt?: string;
  status?: "active" | "banned";
  role?: UserRole;
}

const RoleBadge = ({ role, email }: { role?: string, email: string }) => {
  const defaultRole = email.includes('admin') ? 'Super Admin' : 'Member';
  const currentRole = role || defaultRole;
  
  if (currentRole === 'Super Admin') return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200"><Shield className="w-2.5 h-2.5" /> Super Admin</span>;
  if (currentRole === 'Content Editor') return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200"><Shield className="w-2.5 h-2.5" /> Editor</span>;
  if (currentRole === 'Moderator') return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200"><Shield className="w-2.5 h-2.5" /> Moderator</span>;
  return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200"><Shield className="w-2.5 h-2.5" /> Member</span>;
};

export function UsersSection() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ email: string; name: string } | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = () => {
      try {
        const raw = localStorage.getItem("ecoheritage_users");
        if (raw) {
          setUsers(JSON.parse(raw));
        }
      } catch { /* ignore */ }
    };
    loadUsers();
    const interval = setInterval(loadUsers, 2000);
    window.addEventListener("storage", loadUsers);
    window.addEventListener("storage_sync", loadUsers);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadUsers);
      window.removeEventListener("storage_sync", loadUsers);
    };
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBan = (email: string) => {
    const updated = users.map(u => {
      if (u.email === email) {
        return { ...u, status: u.status === "banned" ? "active" : "banned" } as UserRecord;
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem("ecoheritage_users", JSON.stringify(updated));
    toast.success(`Đã cập nhật trạng thái tài khoản ${email}`);
  };

  const updateRole = (email: string, newRole: string) => {
    const updated = users.map(u => u.email === email ? { ...u, role: newRole as UserRole } : u);
    setUsers(updated);
    localStorage.setItem("ecoheritage_users", JSON.stringify(updated));
    toast.success(`Đã cấp quyền ${newRole} cho tài khoản ${email}`);
    setEditingRole(null);
  };

  const handleDelete = (email: string) => {
    const updated = users.filter(u => u.email !== email);
    setUsers(updated);
    localStorage.setItem("ecoheritage_users", JSON.stringify(updated));
    toast.success(`Đã xóa vĩnh viễn tài khoản ${email}`);
  };

  return (
    <div className="space-y-8">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF] mb-2">Module 5</p>
        <h2 className="text-3xl font-black tracking-tighter text-[#1E293B] sm:text-4xl leading-tight">Quản lý Thành viên</h2>
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-slate-500 font-medium italic">
          Theo dõi và quản trị tài khoản người dùng trên toàn hệ thống. Đảm bảo tính bảo mật và hỗ trợ thành viên trong quá trình khám phá di sản.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${shellCardClass} p-5 flex items-center gap-4 bg-white/50 backdrop-blur-sm`}>
          <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100 shadow-sm">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng cộng</p>
            <p className="text-xl font-black text-slate-900">{users.length}</p>
          </div>
        </div>
        <div className={`${shellCardClass} p-5 flex items-center gap-4 bg-white/50 backdrop-blur-sm`}>
          <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-xl font-black text-slate-900">{users.filter(u => (u.status || 'active') === 'active').length}</p>
          </div>
        </div>
        <div className={`${shellCardClass} p-5 flex items-center gap-4 bg-white/50 backdrop-blur-sm`}>
          <div className="rounded-xl bg-rose-50/50 p-3 border border-rose-100 shadow-sm">
            <Ban className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hạn chế</p>
            <p className="text-xl font-black text-slate-900">{users.filter(u => u.status === 'banned').length}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 bg-slate-50/30">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 outline-none focus:border-blue-400/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                <th className="px-6 py-5 text-left">Thành viên</th>
                <th className="px-6 py-5 text-left">Ngày tham gia</th>
                <th className="px-6 py-5 text-center">Nền tảng</th>
                <th className="px-6 py-5 text-center">Vai trò</th>
                <th className="px-6 py-5 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user, idx) => (
                <tr key={user.email} className="group hover:bg-slate-50/40 transition-all duration-300">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group/avatar shrink-0">
                        <div className="w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-sm transition-transform group-hover/avatar:scale-105">
                          <div className="w-full h-full rounded-[10px] bg-white p-[1px] overflow-hidden">
                            <img 
                              src={localStorage.getItem(`avatar_${user.email}`) || getAvatarUrl(user.name || "Vô danh")} 
                              alt={user.name || "Avatar"} 
                              className="w-full h-full object-cover grayscale-[0.2] contrast-110"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                          {user.name || "Vô danh"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold lowercase mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">
                    {formatDateTime(user.createdAt || new Date().toISOString())}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {user.provider === "google" ? (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-[9px] font-black uppercase border border-slate-200 text-slate-600 shadow-sm">
                            <img src="https://www.google.com/favicon.ico" className="h-3 w-3" alt="Google" />
                            Google
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[9px] font-black uppercase text-white shadow-sm">
                            <Mail className="h-3 w-3" />
                            Email
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RoleBadge role={user.role} email={user.email} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-wider shadow-sm border ${
                        user.status === "banned" 
                          ? "bg-rose-50 text-rose-600 border-rose-100" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "banned" ? "bg-rose-500" : "bg-emerald-500"}`} />
                        {user.status === "banned" ? "Vô hiệu" : "Hoạt động"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const roles = ["Member", "Moderator", "Content Editor", "Super Admin"];
                          const currentRole = user.role || (user.email.includes('admin') ? 'Super Admin' : 'Member');
                          const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
                          updateRole(user.email, nextRole);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Thay đổi quyền (Phân quyền)"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleBan(user.email)}
                        className={`p-2.5 rounded-xl border shadow-sm transition-all active:scale-95 ${
                          user.status === "banned" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                            : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
                        }`}
                        title={user.status === "banned" ? "Kích hoạt tài khoản" : "Vô hiệu hóa tài khoản"}
                      >
                        {user.status === "banned" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ email: user.email, name: user.name || "User" })}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa tài khoản?"
        message={`Bạn sắp xóa vĩnh viễn tài khoản "${deleteTarget?.name}" (${deleteTarget?.email}). Hành động này không thể hoàn tác.`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.email)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
