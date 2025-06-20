import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugins
gsap.registerPlugin(SplitText);

// This function creates continuously cycling animations for the heading
export function animateHeading(elementRef) {
  // Make sure we have a valid reference
  if (!elementRef.current) return;

  // Create SplitText instance for the heading
  const splitHeading = new SplitText(elementRef.current, { type: "chars,words,lines" });
  const chars = splitHeading.chars;
  const words = splitHeading.words;
  const lines = splitHeading.lines;
  
  // Clear any existing animations
  gsap.killTweensOf(chars);
  gsap.killTweensOf(words);
  gsap.killTweensOf(lines);
  
  // Create the master timeline
  const masterTimeline = gsap.timeline({ repeat: -1 });
  
  // Animation 1: Letter-by-letter entrance with bounce
  const animation1 = gsap.timeline();
  animation1.fromTo(chars, 
    {
      opacity: 0,
      scale: 0,
      y: 40,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      ease: "back.out(1.7)",
      stagger: 0.05,
      duration: 0.8
    }
  );
  animation1.to(chars, {
    duration: 2,
    color: "#ffffff",
    textShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
    stagger: {
      amount: 1,
      from: "center"
    }
  }, "+=0.2");
  
  // Animation 2: Wave effect
  const animation2 = gsap.timeline();
  animation2.fromTo(chars, 
    { y: 0 },
    {
      y: -20,
      ease: "sine.inOut",
      duration: 0.5,
      stagger: {
        amount: 0.5,
        from: "start",
        repeat: 1,
        yoyo: true
      }
    }
  );
  animation2.to(chars, {
    rotateZ: 360,
    duration: 1.2,
    ease: "power1.inOut",
    stagger: {
      amount: 0.5,
      from: "random"
    }
  });
  
  // Animation 3: 3D Flip
  const animation3 = gsap.timeline();
  animation3.to(words, {
    rotationY: 360,
    transformOrigin: "50% 50% -40px",
    duration: 1.5,
    ease: "power1.inOut",
    stagger: 0.2
  });
  animation3.to(chars, {
    scale: 1.2,
    duration: 0.6,
    ease: "power1.inOut",
    stagger: {
      amount: 0.4,
      from: "center",
      grid: "auto",
      yoyo: true,
      repeat: 1
    }
  }, "-=0.5");
  
  // Animation 4: Scramble effect
  const animation4 = gsap.timeline();
  let originalPositions = [];
  
  // Store original positions
  chars.forEach(char => {
    originalPositions.push({
      x: char.offsetLeft,
      y: char.offsetTop
    });
  });
  
  animation4.to(chars, {
    x: i => Math.random() * 100 - 50,
    y: i => Math.random() * 50 - 25,
    opacity: 0.7,
    scale: i => 0.8 + Math.random() * 0.5,
    duration: 1.2,
    ease: "power1.inOut"
  });
  animation4.to(chars, {
    x: i => originalPositions[i].x,
    y: i => originalPositions[i].y,
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: "back.out(1.2)"
  });
  

   // Animation 5: Spiral out and in
  const animation5 = gsap.timeline();
  animation5.to(chars, {
    rotation: i => 360 * (i % 2 ? 1 : -1),
    x: i => 100 * Math.cos(i),
    y: i => 100 * Math.sin(i),
    opacity: 0,
    scale: 0,
    duration: 1.5,
    ease: "power2.inOut",
    stagger: {
      amount: 0.5,
      from: "center"
    }
  });
  animation5.to(chars, {
    rotation: 0,
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 1.5,
    ease: "back.out(1.4)",
    stagger: {
      amount: 0.5,
      from: "center"
    }
  });
  

  
  // Animation 6: Character dance
  const animation6 = gsap.timeline();
  animation6.to(chars, {
    y: i => Math.sin(i) * 20,
    x: i => Math.cos(i) * 10,
    rotation: i => (i % 2 ? 15 : -15),
    duration: 0.6,
    ease: "power1.inOut",
    repeat: 1,
    yoyo: true,
    stagger: {
      amount: 0.5,
      from: "start",
      grid: "auto"
    }
  });
  animation6.to(chars, {
    scale: i => 1 + Math.sin(i * 0.5) * 0.5,
    color: i => i % 2 ? "#3b82f6" : "#ffffff",
    textShadow: i => i % 2 ? "0 0 10px rgba(59, 130, 246, 0.8)" : "0 0 10px rgba(255, 255, 255, 0.8)", 
    duration: 1,
    stagger: {
      amount: 0.5,
      from: "center"
    }
  });
  
  // Animation 7: Liquid wave
  const animation7 = gsap.timeline();
  animation7.to(chars, {
    y: (i, target) => Math.sin(i * 0.3) * 30,
    x: (i, target) => Math.cos(i * 0.5) * 20,
    rotation: (i, target) => Math.sin(i * 0.5) * 15,
    color: "#00aaff",
    textShadow: "0 0 15px rgba(0, 170, 255, 0.7)",
    duration: 2,
    ease: "sine.inOut",
    stagger: {
      amount: 1,
      from: "start"
    }
  });
  animation7.to(chars, {
    y: 0,
    x: 0,
    rotation: 0,
    color: "#ffffff",
    textShadow: "none",
    duration: 1.5,
    ease: "power2.out",
    stagger: {
      amount: 0.5,
      from: "end"
    }
  });
  
  // Animation 8: Neon flicker
  const animation8 = gsap.timeline();
  const neonColors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#00ff00", "#0000ff"];
  animation8.to(chars, {
    opacity: i => [1, 0.3, 0.7, 1, 0.5, 1][i % 6],
    color: i => neonColors[i % neonColors.length],
    textShadow: i => `0 0 15px ${neonColors[i % neonColors.length]}, 0 0 25px ${neonColors[i % neonColors.length]}`,
    duration: 0.1,
    repeat: 10,
    repeatRefresh: true,
    ease: "steps(1)",
    stagger: {
      each: 0.05,
      from: "random"
    }
  });
  animation8.to(chars, {
    opacity: 1,
    color: "#ffffff",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
    duration: 0.5,
    ease: "power2.inOut"
  });
  
  // Animation 9: Split lines
  const animation9 = gsap.timeline();
  animation9.to(lines, {
    x: (i, target) => i % 2 ? -100 : 100,
    opacity: 0.5,
    duration: 0.8,
    ease: "power2.inOut",
    stagger: 0.2
  });
  animation9.to(lines, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: "back.out(1.7)",
    stagger: 0.2
  });

  
  
  // Add all animations to master timeline with delays between them
  masterTimeline
    .add(animation1)
    .add("+=0.5")
    .add(animation2)
    .add("+=0.5")
    .add(animation3)
    .add("+=0.5")
    .add(animation4)
    .add("+=0.5")
    .add(animation5)
    .add("+=0.5")
    .add(animation6)
    .add("+=0.5")
    .add(animation7)
    .add("+=0.5")
    .add(animation8)
    .add("+=0.5")
    .add(animation9);
  
  return () => {
    // Cleanup function
    splitHeading.revert();
    masterTimeline.kill();
  };
}