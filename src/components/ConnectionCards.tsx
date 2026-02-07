import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

const connections = [
  {
    image: story1,
    names: "Aisha & Kwame",
    tag: "Adventurer",
    story:
      "They matched over a shared love of hiking. What started as weekend trail walks turned into a cross-country road trip, a surprise proposal at sunset on a mountain peak, and a life built around exploring the world together.",
  },
  {
    image: story2,
    names: "Zuri & Marcus",
    tag: "Foodie",
    story:
      "A first date at a tiny taco stand turned into a tradition. Every anniversary they return to the same spot — now with a family of four. Proof that the best love stories start with good food.",
  },
  {
    image: story3,
    names: "Nia & Darius",
    tag: "Dog Parent",
    story:
      "They bonded over rescue dogs and never looked back. Two humans, three dogs, one apartment, and an endless supply of love. Their Sunday park dates became the stuff of legend among friends.",
  },
];

const cardConfigs = [
  // [index0 z/pos, index1, index2] for each rotation
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
];

const positions = [
  { x: 0, y: 0, rotate: -6, scale: 1, z: 30 },
  { x: 80, y: 18, rotate: 3, scale: 0.92, z: 20 },
  { x: 150, y: 32, rotate: 10, scale: 0.84, z: 10 },
];

const ConnectionCards = () => {
  const [rotation, setRotation] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const order = cardConfigs[rotation];

  return (
    <>
      <div className="relative h-[520px] flex items-center justify-center" style={{ perspective: "1200px" }}>
        <AnimatePresence mode="popLayout">
          {positions.map((pos, posIdx) => {
            const cardIdx = order[posIdx];
            const card = connections[cardIdx];
            return (
              <motion.div
                key={`${cardIdx}-${rotation}`}
                className="absolute cursor-pointer"
                style={{
                  zIndex: pos.z,
                  transformStyle: "preserve-3d",
                }}
                initial={{ opacity: 0, rotateY: -40, x: pos.x, y: pos.y }}
                animate={{
                  opacity: 1,
                  x: pos.x,
                  y: pos.y,
                  rotate: pos.rotate,
                  scale: pos.scale,
                  rotateY: posIdx === 0 ? [0, 6, 0] : 0,
                  rotateX: posIdx === 0 ? [0, -3, 0] : 0,
                }}
                exit={{ opacity: 0, rotateY: 40, scale: 0.8 }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                  rotateY: posIdx === 0 ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined,
                  rotateX: posIdx === 0 ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined,
                }}
                onClick={() => setSelectedCard(cardIdx)}
                whileHover={{
                  scale: pos.scale * 1.05,
                  rotateY: 12,
                  rotateX: -5,
                  boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className="w-56 sm:w-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary-foreground relative group">
                  <img
                    src={card.image}
                    alt={card.names}
                    className="h-[340px] sm:h-[400px] w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block bg-[hsl(45,100%,55%)] text-background text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                      {card.tag}
                    </span>
                    <p className="text-primary-foreground text-sm font-bold">{card.names}</p>
                    <p className="text-primary-foreground/60 text-xs mt-1">Tap to read their story →</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Rotation dots */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setRotation(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                rotation === i ? "w-6 bg-background" : "w-2 bg-background/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Story modal */}
      <AnimatePresence>
        {selectedCard !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="relative max-w-lg w-full rounded-3xl overflow-hidden bg-primary-foreground shadow-2xl"
              initial={{ scale: 0.8, rotateY: -20 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.8, rotateY: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: "800px" }}
            >
              <img
                src={connections[selectedCard].image}
                alt={connections[selectedCard].names}
                className="h-64 w-full object-cover"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 rounded-full bg-background/80 p-2 text-primary-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="p-6">
                <span className="inline-block bg-[hsl(45,100%,55%)] text-background text-xs font-extrabold px-3 py-1 rounded-full mb-3">
                  {connections[selectedCard].tag}
                </span>
                <h3 className="text-2xl font-black text-background">
                  {connections[selectedCard].names}
                </h3>
                <p className="mt-4 text-background/70 leading-relaxed">
                  {connections[selectedCard].story}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConnectionCards;
