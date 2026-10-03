import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";

const SUPABASE_STORAGE = "https://hxiycmrlyswwjqlwihdd.supabase.co/storage/v1/object/public/profile-photos/demo";

const connections = [
  {
    image: `${SUPABASE_STORAGE}/amara-osei/profile.jpg?v=2`,
    names: "Amara & Simone",
    location: "Nairobi, Kenya",
    tag: "Matched 2024",
    story:
      "Two go-getters who almost swiped past each other. Amara's love of travel and Simone's passion for the outdoors turned their first hiking date into a weekly tradition — and eventually, a forever.",
  },
  {
    image: `${SUPABASE_STORAGE}/zara-mensah/profile.jpg`,
    names: "Zara & Kofi",
    location: "Mombasa, Kenya",
    tag: "Engaged",
    story:
      "An architect and a product manager — both building things for a living. Their first date at a design exhibition turned into late-night coffee runs and a ring. Proof that creativity attracts.",
  },
  {
    image: `${SUPABASE_STORAGE}/leila-kamara/profile.jpg`,
    names: "Leila & Darius",
    location: "Kisumu, Kenya",
    tag: "Married",
    story:
      "She was a nurse with a warm heart. He was a lawyer who needed to slow down. One shared meal changed everything. They've been cooking together ever since.",
  },
];

const ConnectionCards = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [direction, setDirection] = useState(1); // 1 = forward

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % connections.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [next]);

  const handleDotClick = (i: number) => {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
  };

  // Build a stack: active card is index 0, then 1 behind, then 2 behind
  const getStackOrder = () => {
    const order: number[] = [];
    for (let offset = 0; offset < connections.length; offset++) {
      order.push((activeIndex + offset) % connections.length);
    }
    return order;
  };

  const stack = getStackOrder();

  return (
    <>
      <div
        className="relative h-[520px] flex items-center justify-center select-none"
        style={{ perspective: "1200px" }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
              "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)",
              "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 400, height: 400, borderRadius: "50%", filter: "blur(60px)" }}
        />

        {/* Card stack — render back-to-front so last rendered = front */}
        {[...stack].reverse().map((cardIdx) => {
          const depth = stack.indexOf(cardIdx); // 0 = front, 1 = middle, 2 = back
          const card = connections[cardIdx];
          const isFront = depth === 0;

          // Stacking offsets
          const xOffset = depth * 55;
          const yOffset = depth * 22;
          const rotateZ = depth === 0 ? -5 : depth === 1 ? 4 : 12;
          const scale = 1 - depth * 0.08;
          const brightness = 1 - depth * 0.15;

          return (
            <motion.div
              key={cardIdx}
              className="absolute cursor-pointer"
              style={{
                zIndex: 30 - depth * 10,
                transformStyle: "preserve-3d",
                filter: `brightness(${brightness})`,
              }}
              layout
              animate={{
                x: xOffset,
                y: yOffset,
                rotate: rotateZ,
                scale,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 22,
                mass: 0.8,
              }}
              onClick={() => setSelectedCard(cardIdx)}
              whileHover={
                isFront
                  ? {
                      scale: scale * 1.06,
                      rotate: rotateZ + 2,
                      y: yOffset - 8,
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                    }
                  : {}
              }
            >
              {/* Card */}
              <div className="relative w-60 sm:w-72 rounded-[1.75rem] overflow-hidden group">
                {/* Gradient border */}
                <div
                  className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-primary/70 via-secondary/40 to-primary/70 p-[2px]"
                  style={{ opacity: isFront ? 1 : 0.4 }}
                >
                  <div className="w-full h-full rounded-[calc(1.75rem-2px)] bg-background" />
                </div>

                {/* Inner content */}
                <div className="relative rounded-[calc(1.75rem-2px)] overflow-hidden m-[2px]">
                  <img
                    src={card.image}
                    alt={card.names}
                    className="h-[360px] sm:h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    draggable={false}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Shimmer on front card */}
                  {isFront && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                    />
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <motion.div
                      initial={false}
                      animate={{ opacity: isFront ? 1 : 0.5, y: isFront ? 0 : 4 }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-lg mb-2.5">
                        <Heart className="w-3 h-3" fill="currentColor" />
                        {card.tag}
                      </span>

                      <h3 className="text-white text-lg font-black tracking-tight leading-tight">
                        {card.names}
                      </h3>
                      <p className="text-white/50 text-sm mt-0.5">{card.location}</p>

                      {isFront && (
                        <motion.div
                          className="flex items-center gap-2 mt-3 text-white/40 text-xs"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Heart className="w-3 h-3" />
                          <span>Tap to read their story</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Verified badge */}
                  {isFront && (
                    <motion.div
                      className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-background text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      Verified
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Navigation dots */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
          {connections.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-500"
              style={{ width: activeIndex === i ? 28 : 10 }}
            >
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  activeIndex === i
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "bg-foreground/15 hover:bg-foreground/25"
                }`}
              />
              {activeIndex === i && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Story modal */}
      <AnimatePresence>
        {selectedCard !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="relative max-w-lg w-full rounded-[2rem] overflow-hidden bg-card shadow-2xl border border-border"
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={connections[selectedCard].image}
                  alt={connections[selectedCard].names}
                  className="h-72 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-sm p-2.5 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-6">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    {connections[selectedCard].tag}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">
                      {connections[selectedCard].names}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {connections[selectedCard].location}
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {connections[selectedCard].story}
                </p>

                <button className="mt-6 w-full gradient-brand rounded-full py-3.5 text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                  Start Your Journey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConnectionCards;
