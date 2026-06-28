"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/lib/api/auth";
import { customerApi } from "@/lib/api/customer";
import { useAuthStore } from "@/stores/auth-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { CheckCircle2, Mail, Phone, UserRound } from "lucide-react";

export function ProfilePageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/profile");
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!ready || !token) return;
    void customerApi.dashboard(token).then((data) => {
      setEmailVerified(data.welcome.emailVerified);
      setPhoneVerified(data.welcome.phoneVerified);
    });
  }, [ready, token]);

  useEffect(() => {
    if (!user?.name) return;
    const [first, ...rest] = user.name.split(" ");
    setFirstName(first ?? "");
    setLastName(rest.join(" "));
  }, [user]);

  const saveProfile = async () => {
    if (!token) return;
    const result = await authApi.updateProfile(token, { firstName, lastName, phone });
    setSession({ accessToken: token, user: result.user });
    toast.success("Profile updated");
  };

  const uploadAvatar = async (file: File) => {
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/customer/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      toast.error("Avatar upload failed");
      return;
    }
    const refreshed = await authApi.me(token);
    setSession({ accessToken: token, user: refreshed });
    toast.success("Profile picture updated");
  };

  const savePassword = async () => {
    if (!token) return;
    await authApi.changePassword(token, { currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated");
  };

  const resendVerification = async () => {
    if (!user?.email) return;
    await authApi.resendVerification(user.email);
    toast.success("Verification email sent");
  };

  const deleteAccount = async () => {
    if (!token) return;
    await customerApi.deleteAccount(token);
    clearSession();
    setDeleteOpen(false);
    toast.success("Account scheduled for deletion");
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Profile management" description="Manage your personal information, avatar, and credentials." icon={UserRound} />
      <div className="flex flex-wrap gap-2">
        <Badge variant={emailVerified ? "success" : "secondary"}>
          <Mail className="mr-1 h-3.5 w-3.5" />
          {emailVerified ? "Email verified" : "Email pending"}
        </Badge>
        <Badge variant={phoneVerified ? "success" : "secondary"}>
          <Phone className="mr-1 h-3.5 w-3.5" />
          {phoneVerified ? "Phone verified" : "Phone pending"}
        </Badge>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-4 rounded-[2rem] border border-border/60 p-6">
          <h2 className="font-display text-2xl font-semibold">Personal information</h2>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile picture</Label>
            <Input id="avatar" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && void uploadAvatar(event.target.files[0])} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          {!emailVerified ? (
            <Button variant="outline" size="sm" onClick={() => void resendVerification()}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resend verification email
            </Button>
          ) : null}
          <Button variant="gradient" onClick={() => void saveProfile()}>
            Save profile
          </Button>
        </section>

        <section className="space-y-4 rounded-[2rem] border border-border/60 p-6">
          <h2 className="font-display text-2xl font-semibold">Password & account</h2>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => void savePassword()}>
            Change password
          </Button>
          <Button variant="ghost" className="text-rose-400" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </section>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This schedules your account for deletion. You will be signed out immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" className="bg-rose-500 hover:bg-rose-600" onClick={() => void deleteAccount()}>
              Confirm deletion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

