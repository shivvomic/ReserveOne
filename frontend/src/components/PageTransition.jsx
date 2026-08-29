import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// initial={false} means the very first page load never animates — only
// subsequent route changes do. Without it, every fresh visit would show a
// pointless fade-in before the user has even seen the page once.
function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;