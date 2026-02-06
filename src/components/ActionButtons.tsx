import { motion } from "framer-motion";
import { X, Heart, Star, RotateCcw, Zap } from "lucide-react";

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
  onBoost: () => void;
}

const ActionButtons = ({ onNope, onLike, onSuperLike, onRewind, onBoost }: ActionButtonsProps) => {
  const buttons = [
    { icon: RotateCcw, onClick: onRewind, size: "small" as const, className: "text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10" },
    { icon: X, onClick: onNope, size: "large" as const, className: "text-red-500 border-red-500/30 hover:bg-red-500/10" },
    { icon: Star, onClick: onSuperLike, size: "small" as const, className: "text-blue-400 border-blue-400/30 hover:bg-blue-400/10" },
    { icon: Heart, onClick: onLike, size: "large" as const, className: "text-green-500 border-green-500/30 hover:bg-green-500/10" },
    { icon: Zap, onClick: onBoost, size: "small" as const, className: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {buttons.map(({ icon: Icon, onClick, size, className }, i) => (
        <motion.button
          key={i}
          onClick={onClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center justify-center rounded-full border-2 bg-card shadow-button transition-colors ${className} ${
            size === "large" ? "h-16 w-16" : "h-12 w-12"
          }`}
        >
          <Icon className={size === "large" ? "h-7 w-7" : "h-5 w-5"} fill="currentColor" />
        </motion.button>
      ))}
    </div>
  );
};

export default ActionButtons;
