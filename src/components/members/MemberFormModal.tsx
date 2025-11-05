"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  createMember,
  updateMember,
  type MemberWithStats,
} from "@/app/actions/members";
import { memberSchema, type MemberFormData } from "@/lib/validations/member";
import { useTranslations } from "@/lib/i18n/hooks";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: MemberWithStats | null;
}

// Preset colors for avatar
const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export function MemberFormModal({
  isOpen,
  onClose,
  onSuccess,
  member,
}: MemberFormModalProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!member;

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      avatarColor: null,
      avatarImage: null,
      isPrimary: false,
    },
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        avatarColor: member.avatarColor,
        avatarImage: member.avatarImage,
        isPrimary: member.isPrimary,
      });
    } else {
      form.reset({
        name: "",
        avatarColor: null,
        avatarImage: null,
        isPrimary: false,
      });
    }
  }, [member, form]);

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);

    try {
      const result = isEditing
        ? await updateMember({ ...data, id: member.id })
        : await createMember(data);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onClose();
        form.reset();
      } else {
        toast.error(result.error || t('members.failedToSave'));
      }
    } catch (error) {
      console.error("Member form error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      form.reset();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('memberForm.editTitle') : t('memberForm.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('memberForm.updateDetails')
              : t('memberForm.addDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Member Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('members.memberName')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('memberForm.memberNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar Color Selection */}
            <FormField
              control={form.control}
              name="avatarColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('members.avatarColor')}</FormLabel>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          field.value === color
                            ? "border-primary scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Primary Member */}
            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('members.isPrimary')}</FormLabel>
                    <FormDescription>
                      {t('members.primaryMemberDesc')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t('memberForm.preview')}</p>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    style={{
                      backgroundColor: form.watch("avatarColor") || "#3b82f6",
                      color: "white",
                    }}
                  >
                    {getInitials(form.watch("name"))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {form.watch("name") || t('memberForm.memberNameDefault')}
                  </p>
                  {form.watch("isPrimary") && (
                    <p className="text-sm text-muted-foreground">
                      {t('members.primaryMember')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="transition-colors hover:bg-[#3EBCB3] hover:text-white hover:border-[#3EBCB3] active:bg-[#3EBCB3] active:text-white"
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = '#3EBCB3';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#3EBCB3';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#3EBCB3', color: 'white' }}
                className="shadow hover:opacity-90"
              >
                {isSubmitting
                  ? t('common.saving')
                  : isEditing
                  ? t('memberForm.updateMember')
                  : t('memberForm.createMember')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
