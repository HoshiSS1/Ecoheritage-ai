import { useState, useEffect } from "react";
import { Users, Mail, Clock, UserPlus, Shield, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { shellCardClass, formatDateTime } from "./adminUtils";
import { ConfirmDialog } from "./ConfirmDialog";

interface UserRecord {
  name: string;
  email: string;
  password: string;
  provider?: "email" | "google";
  createdAt?: string;
  status?: "active" | "banned";
}

export function UsersSection() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ email: string; name: string } | null>(null);

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
    // IT Expert: Super-fast 2s poll for instant account sync
    const interval = setInterval(loadUsers, 2000);
    window.addEventListener("storage", loadUsers);
    window.addEventListener("storage_sync", loadUsers);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadUsers);
      window.removeEventListener("storage_sync", loadUsers);
    };
  }, []);

  const toggleBan = (email: string) => {
    const updated = users.map(u => {
      if (u.email === email) {
        return { ...u, status: u.status === "banned" ? "active" : "banned" } as UserRecord;
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem("ecoheritage_users", JSON.stringify(updated));
    import('sonner').then(({ toast }) => {
      toast.success(`Đã cập nhật trạng thái tài khoản ${email}`);
    });
  };

  const handleDelete = (email: string) => {
    const updated = users.filter(u => u.email !== email);
    setUsers(updated);
    localStorage.setItem("ecoheritage_users", JSON.stringify(updated));
    import('sonner').then(({ toast }) => {
      toast.success(`Đã xóa vĩnh viễn tài khoản ${email}`);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">Module 5</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý người dùng</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Theo dõi tài khoản người dùng đã đăng ký trên nền tảng. Danh sách tự cập nhật mỗi 10 giây.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className={`${shellCardClass} p-5`}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EFF6FF] p-2"><Users className="h-4 w-4 text-[#007BFF]" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng tài khoản</p>
              <p className="text-2xl font-semibold text-slate-950">{users.length}</p>
            </div>
          </div>
        </div>
        <div className={`${shellCardClass} p-5`}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2"><UserPlus className="h-4 w-4 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Đăng ký gần đây</p>
              <p className="text-2xl font-semibold text-slate-950">
                {users.filter(u => {
                  if (!u.createdAt) return false;
                  const diff = Date.now() - new Date(u.createdAt).getTime();
                  return diff < 24 * 60 * 60 * 1000;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className={`${shellCardClass} p-5`}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2"><Shield className="h-4 w-4 text-violet-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Xác thực</p>
              <p className="text-2xl font-semibold text-slate-950">Client-side</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${shellCardClass} overflow-hidden`}>
        <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">Danh sách tài khoản</h3>
          <p className="text-sm text-slate-500">Tự động đồng bộ từ hệ thống đăng ký công khai</p>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="mb-4 rounded-full bg-slate-50 p-6"><Users className="h-12 w-12 text-slate-300" /></div>
            <h4 className="text-lg font-semibold text-slate-600">Chưa có người dùng nào</h4>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-sm">
              Khi người dùng đăng ký tài khoản trên website, thông tin sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-5 py-3 sm:px-6">#</th>
                  <th className="px-5 py-3">Họ tên</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 sm:px-6">Ngày đăng ký</th>
                  <th className="px-5 py-3">Phương thức</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.email} className="border-t border-slate-200/70 align-top hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 sm:px-6 text-sm text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {user.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <p className="font-medium text-slate-950 text-sm">{user.name || "Chưa đặt tên"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {user.createdAt ? formatDateTime(user.createdAt) : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {user.provider === "google" ? (
                          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                             <img src="https://www.google.com/favicon.ico" className="h-3 w-3" alt="G" />
                             Google
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                             <Mail className="h-3 w-3" />
                             Email
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        user.status === "banned" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {user.status === "banned" ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleBan(user.email)}
                          title={user.status === "banned" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          className={`p-2 rounded-xl transition-all ${
                            user.status === "banned" 
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" 
                              : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                          }`}
                        >
                          {user.status === "banned" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ email: user.email, name: user.name || "Người dùng ẩn danh" })}
                          title="Xóa tài khoản vĩnh viễn"
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
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
        )}
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
