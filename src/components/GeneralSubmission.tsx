import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "@capacitor/camera";
import { CameraResultType, CameraSource } from "@capacitor/camera";
import { Loader2, Upload, X } from "lucide-react";

interface GeneralSubmissionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GeneralSubmission = ({ open, onOpenChange }: GeneralSubmissionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    reason: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        setImageFile(file);
        setImagePreview(image.webPath);
      }
    } catch (error: any) {
      if (error.message !== "User cancelled photos app") {
        toast({
          title: "Camera Error",
          description: "Failed to take photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.reason || !imageFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload a photo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload image to storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("general-submissions")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("general-submissions")
        .getPublicUrl(filePath);

      // Insert submission record
      const { error: insertError } = await supabase
        .from("general_submissions")
        .insert({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          email: formData.email || null,
          reason: formData.reason,
          photo_url: publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Submission Successful!",
        description: "Thank you for your contribution. We'll review it soon!",
      });

      // Reset form
      setFormData({ fullName: "", phoneNumber: "", email: "", reason: "" });
      setImageFile(null);
      setImagePreview("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-4 border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">Share Your Eco Action! 🌱</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="fullName" className="font-bold text-base">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Your name"
              className="border-4 border-border rounded-2xl font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="font-bold text-base">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Your phone number"
              className="border-4 border-border rounded-2xl font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-bold text-base">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="border-4 border-border rounded-2xl font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="reason" className="font-bold text-base">What did you do? *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Describe your eco-friendly action..."
              rows={4}
              className="border-4 border-border rounded-2xl font-semibold"
            />
          </div>

          <div>
            <Label className="font-bold text-base">Upload Photo *</Label>
            <div className="mt-2 space-y-3">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl border-4 border-border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 border-4 border-border"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 border-4 border-border font-bold"
                  onClick={handleTakePhoto}
                >
                  📷 Take Photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 border-4 border-border font-bold"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1 border-4 border-border font-bold">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1 border-4 border-border font-bold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
