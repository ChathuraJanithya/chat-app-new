import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown"; // Replace with your actual Markdown import

//@ts-ignore
const AnimatedStreamingMessage = ({ message, isStreaming = false }) => {
  const [animatedWords, setAnimatedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Split content into words while preserving whitespace and special characters
  const words = useMemo(() => {
    if (!message.content) return [];
    // This regex preserves spaces, newlines, and punctuation as separate tokens
    return message.content.split(/(\s+|\n|[.,!?;:])/);
  }, [message.content]);

  useEffect(() => {
    if (!isStreaming) {
      // If not streaming, show all words immediately
      setAnimatedWords(words);
      setCurrentWordIndex(words.length);
      return;
    }

    // Reset animation state when streaming starts
    setAnimatedWords([]);
    setCurrentWordIndex(0);

    // Animate words appearing one by one
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (newIndex <= words.length) {
          setAnimatedWords(words.slice(0, newIndex));
        }
        if (newIndex >= words.length) {
          clearInterval(interval);
        }
        return newIndex;
      });
    }, 100); // Adjust speed: lower = faster, higher = slower

    return () => clearInterval(interval);
  }, [words, isStreaming]);

  // If not streaming or no animation needed, use regular Markdown
  if (!isStreaming || words.length === 0) {
    return (
      <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
        <Markdown>{message.content}</Markdown>
      </div>
    );
  }

  // For streaming with animation
  return (
    <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
      <div className="inline">
        <AnimatePresence mode="popLayout">
          {animatedWords.map((word, index) => (
            <motion.span
              key={`word-${index}-${word}`}
              initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
                delay: 0,
              }}
              className="inline-block"
              style={{
                // Preserve whitespace and line breaks
                //@ts-ignore
                whiteSpace: word.includes("\n") ? "pre-line" : "pre",
              }}
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Animated cursor */}
        {isStreaming && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 align-middle"
          />
        )}
      </div>
    </div>
  );
};

// Alternative version with different animation styles
const AnimatedStreamingMessageVariant = ({
  //@ts-ignore
  message,
  isStreaming = false,
  variant = "fade",
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [words, setWords] = useState([]);

  const animationVariants = {
    fade: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    typewriter: {
      initial: { width: 0, opacity: 0 },
      animate: { width: "auto", opacity: 1 },
      transition: { duration: 0.2, ease: "linear" },
    },
    bounce: {
      initial: { opacity: 0, scale: 0.8, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0.4, type: "spring", bounce: 0.4 },
    },
    blur: {
      initial: { opacity: 0, filter: "blur(4px)", scale: 0.95 },
      animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    const splitWords = message.content.split(/(\s+|\n)/);
    setWords(splitWords);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < splitWords.length) {
        setDisplayedContent(splitWords.slice(0, currentIndex + 1).join(""));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [message.content, isStreaming]);

  if (!isStreaming) {
    return (
      <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
        <Markdown>{message.content}</Markdown>
      </div>
    );
  }

  const displayWords = displayedContent.split(/(\s+|\n)/);
  //@ts-ignore
  const animation = animationVariants[variant];

  return (
    <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
      <div>
        <AnimatePresence>
          {displayWords.map((word, index) => (
            <motion.span
              key={`${index}-${word}`}
              initial={animation.initial}
              animate={animation.animate}
              transition={animation.transition}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { AnimatedStreamingMessage, AnimatedStreamingMessageVariant };
