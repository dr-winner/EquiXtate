
import { toast } from "@/components/ui/use-toast";

/**
 * Handle share functionality for sharing content
 */
export const handleShare = async (title: string, url?: string) => {
  const shareData = {
    title: title,
    text: "Check out this property on EquiXtate!",
    url: url || window.location.href
  };

  try {
    if (navigator.share && isMobileDevice()) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback for desktop or browsers without native sharing
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied",
        description: "Property link has been copied to your clipboard",
      });
      return true;
    }
  } catch (error) {
    console.error("Error sharing:", error);
    toast({
      title: "Share Failed",
      description: "Could not share. Please try manually.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Check if user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Handle exploration of section by scrolling to it
 */
export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  } else {
    toast({
      title: "Section Not Found",
      description: `The ${sectionId} section could not be found.`,
    });
  }
};

/**
 * Show toast for features coming soon
 */
export const notifyFeatureComingSoon = (featureName: string): void => {
  toast({
    title: `${featureName}`,
    description: `${featureName} will be available in the next platform update.`,
  });
};

/**
 * Get tier label based on token price
 */
export const getPriceTier = (tokenPrice: number): string => {
  if (tokenPrice >= 80) return "Premium"; 
  if (tokenPrice >= 30) return "Standard"; 
  return "Basic";
};
