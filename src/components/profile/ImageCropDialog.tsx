"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/hooks";

type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
};

export default function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const t = useTranslations();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: "px",
      width: size,
      height: size,
      x,
      y,
    });
  }, []);

  const getCroppedImage = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current) {
        reject(new Error("No crop area defined"));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No 2d context"));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to crop size
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas is empty"));
          }
        },
        "image/jpeg",
        0.95
      );
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImage();
      onCropComplete(croppedBlob);
      onOpenChange(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("profile.cropImage")}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center py-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ maxWidth: "100%", maxHeight: "60vh" }}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCropConfirm} style={{ backgroundColor: "#3EBCB3" }}>
            {t("profile.applyCrop")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
