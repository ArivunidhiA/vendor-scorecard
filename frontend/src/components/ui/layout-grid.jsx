import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} Card
 * @property {number} id
 * @property {React.ReactNode} content
 * @property {string} className
 * @property {string} [thumbnail] - Optional; omit for text-only cards (faceContent fills the card)
 * @property {React.ReactNode} [faceContent] - Card face when not expanded; required for text-only cards
 */

/**
 * Expandable card grid: click a card to expand and show content over thumbnail.
 * @param {{ cards: Card[], columns?: 2 | 3 }} props
 */
export function LayoutGrid({ cards, columns = 3 }) {
  const [selected, setSelected] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);

  const handleClick = (card) => {
    if (selected?.id === card.id) {
      handleOutsideClick();
      return;
    }
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={cn('w-full grid grid-cols-1 max-w-6xl mx-auto gap-4 relative', gridCols)}>
      {cards.map((card) => (
        <div key={card.id} className={cn(card.className, 'relative min-h-[200px] md:min-h-[240px]')}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              'relative overflow-hidden rounded-2xl cursor-pointer',
              'bg-white/[0.04] border border-white/[0.06] h-full',
              selected?.id === card.id
                ? 'absolute inset-0 z-50 flex justify-center items-end flex-wrap flex-col rounded-2xl'
                : lastSelected?.id === card.id
                  ? 'z-40 h-full w-full'
                  : 'h-full w-full'
            )}
            layoutId={`card-${card.id}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            {card.thumbnail ? (
              <>
                <ImageComponent card={card} />
                {card.faceContent && selected?.id !== card.id && (
                  <div className="absolute inset-0 z-[20] flex flex-col justify-end rounded-2xl p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                    <div className="pointer-events-auto">{card.faceContent}</div>
                  </div>
                )}
              </>
            ) : (
              selected?.id !== card.id && card.faceContent && (
                <div className="absolute inset-0 z-[20] flex flex-col justify-center rounded-2xl p-6 pointer-events-none">
                  <div className="pointer-events-auto">{card.faceContent}</div>
                </div>
              )
            )}
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          'absolute inset-0 left-0 top-0 right-0 bottom-0 w-full h-full bg-black/50 z-10',
          selected?.id ? 'pointer-events-auto backdrop-blur-md' : 'pointer-events-none'
        )}
        animate={{ opacity: selected?.id ? 0.6 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}

function ImageComponent({ card }) {
  if (!card.thumbnail) return null;
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      height={500}
      width={500}
      className="object-cover object-center absolute inset-0 h-full w-full transition duration-200"
      alt=""
    />
  );
}

function SelectedCard({ selected }) {
  if (!selected) return null;
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-2xl relative z-[60]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 h-full w-full bg-black/60 z-10 rounded-2xl"
      />
      <motion.div
        layoutId={`content-${selected.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 40 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative px-6 py-5 z-[70]"
      >
        {selected.content}
      </motion.div>
    </div>
  );
}
