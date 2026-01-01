import { memo } from "react";
import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = memo(function FloatingWhatsApp() {
  const phoneNumber = "880171780127"; // Bangladesh number
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20Salman%2C%20I%27d%20like%20to%20discuss%20a%20project%20with%20you.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group transform-gpu"
      aria-label="Chat with us on WhatsApp"
    >
      {/* Glow background - only on hover */}
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-0 group-hover:opacity-60 transition-opacity duration-200 blur-lg" />
      
      {/* Main button */}
      <div className="relative w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/40
                      flex items-center justify-center transition-transform duration-200 group-hover:scale-110
                      border border-green-300/50 transform-gpu"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-card border border-border rounded-lg text-xs font-mono text-foreground whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with us
      </div>
    </a>
  );
});

export default FloatingWhatsApp;
