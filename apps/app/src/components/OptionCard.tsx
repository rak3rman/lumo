import { Card, CardContent } from "@app/components/ui/card";
import styles from "./StepForm.module.css";

interface OptionCardProps {
  id: number;
  label: string;
  imageUrl: string;
  isSelected: boolean;
  isAnimating: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function OptionCard({
  id,
  label,
  imageUrl,
  isSelected,
  isAnimating,
  isDisabled,
  onClick,
}: OptionCardProps) {
  // Properly encode the image URL to handle spaces and special characters
  const encodedImageUrl = encodeURI(imageUrl);

  return (
    <Card
      className={`relative overflow-hidden border-2 border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer p-0 w-full ${
        !isDisabled ? "hover:border-gray-500" : ""
      } ${isAnimating && !isSelected ? "opacity-30 pointer-events-none" : ""}`}
      style={{
        ...(isSelected && {
          animation: `${styles.borderFlash} 0.8s ease-in-out forwards`,
          borderColor: "#d1d5db",
        }),
      }}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] h-56 w-full">
          {/* Background Image Container */}
          <div
            className="w-full h-full bg-gray-300 relative"
            style={{
              backgroundImage: `url(${encodedImageUrl})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Option label */}
            <div className="absolute bottom-3 left-3 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium text-gray-700 max-w-fit">
              <div
                className="overflow-hidden"
                style={{
                  display: "-webkit-box",
                  lineHeight: "1.2",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
              >
                {label}
              </div>
            </div>

            {/* Selection indicator - Typeform-style checkmark */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className="text-white text-xs font-bold">✓</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
