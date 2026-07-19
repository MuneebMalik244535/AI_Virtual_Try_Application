import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Upload, Camera, Shield } from "lucide-react";
import { PreferencesProvider } from "../context/preferences-context";

export function ImageUpload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    navigate("/processing");
  };

  const handleSkip = () => {
    navigate("/processing");
  };

  return (
    <PreferencesProvider>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="p-8 md:p-12 border-neutral-200 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-semibold mb-2">Upload Your Photo</h2>
              <p className="text-neutral-600">
                Upload your photo so our AI stylist can better recommend outfits tailored to you.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? "border-black bg-neutral-100"
                  : uploadedImage
                  ? "border-neutral-300"
                  : "border-neutral-300 hover:border-black"
              }`}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <label className="inline-block">
                    <span className="text-black hover:underline cursor-pointer">
                      Change photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-neutral-400" />
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-black font-medium hover:underline">
                        Choose a file
                      </span>
                      <span className="text-neutral-600"> or drag and drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-neutral-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-neutral-100 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-neutral-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600">
                Your privacy is important. Photos are processed securely and never shared with third parties.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1 border-neutral-300"
              >
                Skip this step
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!uploadedImage}
                className="flex-1 bg-black text-white hover:bg-black/90 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PreferencesProvider>
  );
}
