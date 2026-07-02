"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import PageBreadcrumb from "@/components/admin/header/pagebreadcrumb";
import PageHeader from "@/components/admin/header/pageHeader";
import { DialogModal } from "@/components/custom/custom-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminProfile,
  useCancelAdminEmailChange,
  useChangeAdminPassword,
  useRequestAdminEmailChange,
  useUpdateAdminName,
  useUpdateAdminRole,
  useVerifyAdminEmailChange,
} from "@/hooks/use-admin-settings";
import {
  ChangeAdminPasswordSchema,
  RequestAdminEmailChangeSchema,
  UpdateAdminNameSchema,
  UpdateAdminRoleSchema,
  VerifyAdminEmailChangeSchema,
  type ChangeAdminPasswordValues,
  type RequestAdminEmailChangeValues,
  type UpdateAdminNameValues,
  type UpdateAdminRoleValues,
  type VerifyAdminEmailChangeValues,
} from "@/validators/schemas/admin-settings";

function SettingsRow({
  icon,
  iconClassName,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: React.ReactNode;
  description: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClassName ?? "bg-muted"}`}
        >
          {icon}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">{title}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {children}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default function AccountSettings() {
  const { data: profile, isLoading } = useAdminProfile();
  const { mutateAsync: updateName, isLoading: isUpdatingName } = useUpdateAdminName();
  const { mutateAsync: requestEmailChange, isLoading: isRequestingEmail } =
    useRequestAdminEmailChange();
  const { mutateAsync: verifyEmailChange, isLoading: isVerifyingEmail } =
    useVerifyAdminEmailChange();
  const { mutateAsync: cancelEmailChange, isLoading: isCancellingEmail } =
    useCancelAdminEmailChange();
  const { mutateAsync: changePassword, isLoading: isChangingPassword } =
    useChangeAdminPassword();
  const { mutateAsync: updateRole, isLoading: isUpdatingRole } = useUpdateAdminRole();

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const nameForm = useForm<UpdateAdminNameValues>({
    resolver: zodResolver(UpdateAdminNameSchema),
    defaultValues: { name: "" },
  });

  const emailForm = useForm<RequestAdminEmailChangeValues>({
    resolver: zodResolver(RequestAdminEmailChangeSchema),
    defaultValues: { email: "" },
  });

  const verifyForm = useForm<VerifyAdminEmailChangeValues>({
    resolver: zodResolver(VerifyAdminEmailChangeSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<ChangeAdminPasswordValues>({
    resolver: zodResolver(ChangeAdminPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const roleForm = useForm<UpdateAdminRoleValues>({
    resolver: zodResolver(UpdateAdminRoleSchema),
    defaultValues: { role: "ADMIN" },
  });

  useEffect(() => {
    if (profile?.name) {
      nameForm.reset({ name: profile.name });
    }
  }, [profile?.name, nameForm]);

  useEffect(() => {
    if (profile?.role) {
      roleForm.reset({ role: profile.role });
    }
  }, [profile?.role, roleForm]);

  async function handleNameUpdate(values: UpdateAdminNameValues) {
    const result = await updateName(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update name");
      return;
    }
    toast.success("Name updated successfully");
    setNameModalOpen(false);
  }

  async function handleEmailRequest(values: RequestAdminEmailChangeValues) {
    const result = await requestEmailChange(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to send verification email");
      return;
    }
    toast.success("Verification code sent to your new email");
    setEmailModalOpen(false);
    verifyForm.reset({ code: "" });
    setVerifyModalOpen(true);
  }

  async function handleEmailVerify(values: VerifyAdminEmailChangeValues) {
    const result = await verifyEmailChange(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to verify email");
      return;
    }
    toast.success("Email updated successfully");
    verifyForm.reset();
    setVerifyModalOpen(false);
  }

  async function handleCancelEmailChange() {
    const result = await cancelEmailChange();
    if (!result.success) {
      toast.error(result.error ?? "Failed to cancel email change");
      return;
    }
    toast.success("Pending email change cancelled");
  }

  async function handlePasswordChange(values: ChangeAdminPasswordValues) {
    const result = await changePassword(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to change password");
      return;
    }
    toast.success("Password changed successfully");
    passwordForm.reset();
    setPasswordModalOpen(false);
  }

  async function handleRoleUpdate(values: UpdateAdminRoleValues) {
    const result = await updateRole(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update role");
      return;
    }
    toast.success("Role updated successfully");
    setRoleModalOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <PageBreadcrumb />
        <PageHeader
          title="Account Settings"
          description="Manage your admin profile, email, password, and role."
        />
        <Card className="max-w-3xl">
          <CardContent className="space-y-4 pt-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-md bg-muted" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const emailVerificationPending = profile?.emailVerificationPending ?? false;

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <PageBreadcrumb />
        <PageHeader
          title="Account Settings"
          description="Manage your admin profile, email, password, and role."
        />

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Profile & security</CardTitle>
            <CardDescription>
              Update your account details and keep your admin access secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsRow
              icon={<User className="size-5 text-blue-600 dark:text-blue-400" />}
              iconClassName="bg-blue-100 dark:bg-blue-950"
              title={<span className="font-medium">Display name</span>}
              description="Your name shown across the admin portal"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    nameForm.reset({ name: profile?.name ?? "" });
                    setNameModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              }
            >
              <p className="text-sm font-medium">{profile?.name}</p>
            </SettingsRow>

            <SettingsRow
              icon={<Mail className="size-5 text-green-600 dark:text-green-400" />}
              iconClassName="bg-green-100 dark:bg-green-950"
              title={
                <>
                  <span className="font-medium">Email address</span>
                  {emailVerificationPending ? (
                    <Badge variant="warning" appearance="light" className="gap-1">
                      <AlertTriangle className="size-3" />
                      Pending verification
                    </Badge>
                  ) : (
                    <Badge variant="success" appearance="light" className="gap-1">
                      <CheckCircle className="size-3" />
                      Active
                    </Badge>
                  )}
                </>
              }
              description={
                emailVerificationPending
                  ? "Verify your new email address to complete the change"
                  : "Change your login email. A verification code will be sent to the new address."
              }
              action={
                <div className="flex flex-wrap gap-2">
                  {emailVerificationPending ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          verifyForm.reset({ code: "" });
                          setVerifyModalOpen(true);
                        }}
                      >
                        Enter code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCancellingEmail}
                        onClick={handleCancelEmailChange}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        emailForm.reset({ email: profile?.email ?? "" });
                        setEmailModalOpen(true);
                      }}
                    >
                      Change
                    </Button>
                  )}
                </div>
              }
            >
              <p className="text-sm font-medium">{profile?.email}</p>
              {emailVerificationPending && profile?.pendingEmail ? (
                <p className="text-sm text-muted-foreground">
                  Pending: {profile.pendingEmail}
                </p>
              ) : null}
            </SettingsRow>

            <SettingsRow
              icon={<Lock className="size-5 text-blue-600 dark:text-blue-400" />}
              iconClassName="bg-blue-100 dark:bg-blue-950"
              title={<span className="font-medium">Password</span>}
              description="Update your password to keep your account secure"
              action={
                <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
                  Change
                </Button>
              }
            />

            {profile?.role === "SUPER_ADMIN" ? (
              <SettingsRow
                icon={<Shield className="size-5 text-purple-600 dark:text-purple-400" />}
                iconClassName="bg-purple-100 dark:bg-purple-950"
                title={
                  <>
                    <span className="font-medium">Admin role</span>
                    <Badge variant="secondary" appearance="light">
                      {profile.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </Badge>
                  </>
                }
                description="Update your access level within the admin portal"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      roleForm.reset({ role: profile.role });
                      setRoleModalOpen(true);
                    }}
                  >
                    Update
                  </Button>
                }
              />
            ) : (
              <SettingsRow
                icon={<Shield className="size-5 text-purple-600 dark:text-purple-400" />}
                iconClassName="bg-purple-100 dark:bg-purple-950"
                title={
                  <>
                    <span className="font-medium">Admin role</span>
                    <Badge variant="secondary" appearance="light">
                      Admin
                    </Badge>
                  </>
                }
                description="Your role is managed by a super admin"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <DialogModal
        open={nameModalOpen}
        setOpen={setNameModalOpen}
        title="Update name"
        description="Change the name shown in the admin portal"
        showFooter={false}
      >
        <Form {...nameForm}>
          <form onSubmit={nameForm.handleSubmit(handleNameUpdate)} className="space-y-4">
            <FormField
              control={nameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setNameModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingName}>
                {isUpdatingName ? "Saving..." : "Save name"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogModal>

      <DialogModal
        open={emailModalOpen}
        setOpen={setEmailModalOpen}
        title="Change email address"
        description="We'll send a 6-digit verification code to your new email"
        showFooter={false}
      >
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailRequest)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isRequestingEmail}>
                {isRequestingEmail ? "Sending..." : "Send verification code"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogModal>

      <DialogModal
        open={verifyModalOpen}
        setOpen={setVerifyModalOpen}
        title="Verify new email"
        description={
          profile?.pendingEmail
            ? `Enter the 6-digit code sent to ${profile.pendingEmail}`
            : "Enter the 6-digit verification code"
        }
        showFooter={false}
      >
        <Form {...verifyForm}>
          <form onSubmit={verifyForm.handleSubmit(handleEmailVerify)} className="space-y-4">
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="text-center font-mono text-lg tracking-[0.4em]"
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifyingEmail}>
                {isVerifyingEmail ? "Verifying..." : "Verify email"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogModal>

      <DialogModal
        open={passwordModalOpen}
        setOpen={setPasswordModalOpen}
        title="Change password"
        description="Enter your current password and choose a new one"
        showFooter={false}
      >
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  passwordForm.reset();
                  setPasswordModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing..." : "Change password"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogModal>

      <DialogModal
        open={roleModalOpen}
        setOpen={setRoleModalOpen}
        title="Update admin role"
        description="Choose your access level. You cannot remove the last super admin role."
        showFooter={false}
      >
        <Form {...roleForm}>
          <form onSubmit={roleForm.handleSubmit(handleRoleUpdate)} className="space-y-4">
            <FormField
              control={roleForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingRole}>
                {isUpdatingRole ? "Updating..." : "Update role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogModal>
    </>
  );
}
