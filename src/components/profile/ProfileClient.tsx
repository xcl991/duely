"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n/hooks";
import { toast } from "sonner";
import ImageCropDialog from "./ImageCropDialog";

type ProfileClientProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function ProfileClient({ user }: ProfileClientProps) {
  const { update } = useSession();
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name || "");
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.invalidImageType"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.imageTooLarge"));
      return;
    }

    // Read file for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], "profile.jpg", {
      type: "image/jpeg",
    });

    setSelectedFile(croppedFile);

    // Create preview from blob
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = user.image;

      // Upload image if a new one was selected
      if (selectedFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload/profile-image", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
        setIsUploadingImage(false);
      }

      // Update profile
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session
      await update({
        name,
        image: imageUrl,
      });

      toast.success(t("profile.updateSuccess"));

      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.updateError"));
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
          <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} alt={name || "User"} />
                  <AvatarFallback className="bg-slate-700 text-white text-2xl">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4 text-gray-700" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="font-medium">{t("profile.profilePhoto")}</h3>
                <p className="text-sm text-muted-foreground">{t("profile.photoDesc")}</p>
                {selectedFile && (
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {t("profile.newPhotoSelected")}: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("profile.namePlaceholder")}
                disabled={isLoading}
                required
              />
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t("profile.emailReadonly")}</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} style={{ backgroundColor: "#3EBCB3" }}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImage ? t("profile.uploading") : t("common.saving")}
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
