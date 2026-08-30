import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Camera, Image, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AvatarUploadMenu({
  onFileSelected,
  onDelete,
  hasAvatar,
  disabled,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coords, setCoords] = useState(null); // { top, left } for desktop anchor
  const triggerRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onFileSelected(file);
    setMenuOpen(false);
    e.target.value = "";
  };

  // Measure the trigger's position right before the menu opens, so the
  // portaled popover (now a direct child of <body>) can anchor itself
  // near the button instead of relying on a positioned ancestor.
  const openMenu = useCallback(() => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
    setMenuOpen(true);
  }, [disabled]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    // Close on resize/scroll to avoid a stale, misplaced popover
    const handleReposition = () => setMenuOpen(false);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [menuOpen]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) (menuOpen ? setMenuOpen(false) : openMenu());
        }}
      >
        {children}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop overlay — portaled to <body>, always covers the full viewport */}
              <div
                className="fixed inset-0 z-[100] bg-zinc-900/30 backdrop-blur-[1px] sm:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />

              {/* Menu Popover / Bottom Sheet — portaled, so it's never trapped
                  inside a transformed ancestor (Framer Motion pages, etc.) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={
                  coords
                    ? {
                        // Desktop: anchored just below-right of the trigger button
                        top: coords.top,
                        right: coords.right,
                      }
                    : undefined
                }
                className="fixed bottom-0 left-0 right-0 z-[101] bg-white border-t border-zinc-200 rounded-t-2xl p-4 shadow-2xl
                  sm:bottom-auto sm:left-auto sm:w-60 sm:rounded-2xl sm:border sm:p-2 sm:shadow-xl"
              >
                {/* Mobile Header */}
                <div className="flex justify-between items-center px-1 pb-3 mb-2 border-b border-zinc-100 sm:hidden">
                  <span className="text-sm font-semibold text-zinc-900">
                    Update Profile Photo
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {/* Take Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      cameraInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                      text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium leading-none">
                      Take Photo
                    </span>
                  </button>

                  {/* Choose from Gallery */}
                  <button
                    type="button"
                    onClick={() => {
                      galleryInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                      text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Image className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium leading-none">
                      Choose from Gallery
                    </span>
                  </button>

                  {/* Remove Photo */}
                  {hasAvatar && onDelete && (
                    <>
                      <div className="my-1 border-t border-zinc-100" />
                      <button
                        type="button"
                        onClick={() => {
                          onDelete();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                          text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors duration-150 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium leading-none">
                          Remove Photo
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

