
import { useEffect, useRef } from "react";

const snowflakeCount = 50;
const rainDropCount = 100;
const cloudCount = 5;

const WeatherAnimation = ({ weatherType = "default", isDay = true }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);
    
    // Animation elements
    let elements = [];
    
    // Setup based on weather type
    const setupAnimation = () => {
      elements = [];
      
      switch (weatherType) {
        case "sunny":
          createSunAnimation(isDay);
          break;
        case "cloudy":
          createCloudAnimation();
          break;
        case "rainy":
          createRainAnimation();
          break;
        case "snowy":
          createSnowAnimation();
          break;
        case "stormy":
          createStormAnimation();
          break;
        case "foggy":
          createFogAnimation();
          break;
        default:
          // Default animation (light clouds)
          createLightCloudAnimation();
      }
    };
    
    // Create sun animation
    const createSunAnimation = (isDay) => {
      if (isDay) {
        // Sun with rays
        elements.push({
          type: "sun",
          x: canvas.width * 0.8,
          y: canvas.height * 0.2,
          radius: 60,
          rayLength: 30,
          rayCount: 12,
          draw: function() {
            // Sun glow
            const gradient = ctx.createRadialGradient(
              this.x, this.y, this.radius * 0.5,
              this.x, this.y, this.radius * 2
            );
            gradient.addColorStop(0, "rgba(255, 255, 190, 0.8)");
            gradient.addColorStop(1, "rgba(255, 255, 190, 0)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun circle
            ctx.fillStyle = "rgba(255, 230, 100, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
          },
          update: function() {
            // Slight floating effect
            this.y += Math.sin(Date.now() / 3000) * 0.5;
          }
        });
        
        // Add a few light clouds
        for (let i = 0; i < 3; i++) {
          createCloud(0.5);
        }
      } else {
        // Moon at night
        elements.push({
          type: "moon",
          x: canvas.width * 0.8,
          y: canvas.height * 0.2,
          radius: 50,
          draw: function() {
            // Moon glow
            const gradient = ctx.createRadialGradient(
              this.x, this.y, this.radius * 0.5,
              this.x, this.y, this.radius * 2
            );
            gradient.addColorStop(0, "rgba(200, 220, 255, 0.3)");
            gradient.addColorStop(1, "rgba(200, 220, 255, 0)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon
            ctx.fillStyle = "rgba(220, 230, 255, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon shadow to create crescent
            ctx.fillStyle = "rgba(30, 50, 100, 0.15)";
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.3, this.y, this.radius * 0.9, 0, Math.PI * 2);
            ctx.fill();
          },
          update: function() {
            // Slight floating effect
            this.y += Math.sin(Date.now() / 3000) * 0.5;
          }
        });
        
        // Add stars
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height * 0.7;
          const radius = Math.random() * 1.5 + 0.5;
          const twinkleSpeed = Math.random() * 0.02 + 0.01;
          
          elements.push({
            type: "star",
            x,
            y,
            radius,
            twinkleSpeed,
            twinkleAmount: 0,
            draw: function() {
              const opacity = 0.5 + Math.sin(this.twinkleAmount) * 0.5;
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
              ctx.fill();
            },
            update: function() {
              this.twinkleAmount += this.twinkleSpeed;
            }
          });
        }
      }
    };
    
    // Create cloud animation
    const createCloudAnimation = () => {
      for (let i = 0; i < cloudCount; i++) {
        createCloud();
      }
    };
    
    // Create a single cloud
    const createCloud = (opacity = 1) => {
      const cloudWidth = Math.random() * 200 + 100;
      const cloudHeight = cloudWidth * 0.6;
      const x = Math.random() * (canvas.width + cloudWidth) - cloudWidth;
      const y = Math.random() * canvas.height * 0.5;
      const speed = Math.random() * 0.5 + 0.1;
      
      elements.push({
        type: "cloud",
        x,
        y,
        width: cloudWidth,
        height: cloudHeight,
        speed,
        opacity: opacity * (Math.random() * 0.4 + 0.6),
        draw: function() {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          
          // Draw cloud shape
          const radius = this.height / 2;
          ctx.beginPath();
          ctx.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
          ctx.arc(this.x + this.width - radius, this.y + radius, radius, 0, Math.PI * 2);
          ctx.rect(this.x + radius, this.y, this.width - radius * 2, radius * 2);
          ctx.fill();
          
          // Add cloud details
          const detailRadius = radius * 0.7;
          ctx.beginPath();
          ctx.arc(this.x + this.width * 0.2, this.y, detailRadius, 0, Math.PI * 2);
          ctx.arc(this.x + this.width * 0.5, this.y, detailRadius * 1.2, 0, Math.PI * 2);
          ctx.arc(this.x + this.width * 0.7, this.y, detailRadius, 0, Math.PI * 2);
          ctx.fill();
        },
        update: function() {
          this.x += this.speed;
          if (this.x > canvas.width + this.width) {
            this.x = -this.width;
            this.y = Math.random() * canvas.height * 0.5;
          }
        }
      });
    };
    
    // Create light cloud animation
    const createLightCloudAnimation = () => {
      for (let i = 0; i < 3; i++) {
        createCloud(0.7);
      }
    };
    
    // Create rain animation
    const createRainAnimation = () => {
      // Add clouds
      for (let i = 0; i < cloudCount; i++) {
        createCloud();
      }
      
      // Add raindrops
      for (let i = 0; i < rainDropCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const length = Math.random() * 15 + 10;
        const speed = Math.random() * 15 + 15;
        const thickness = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.3 + 0.3;
        
        elements.push({
          type: "raindrop",
          x,
          y,
          length,
          speed,
          thickness,
          opacity,
          draw: function() {
            ctx.strokeStyle = `rgba(200, 220, 255, ${this.opacity})`;
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);
            ctx.stroke();
          },
          update: function() {
            this.y += this.speed;
            if (this.y > canvas.height) {
              this.y = -this.length;
              this.x = Math.random() * canvas.width;
            }
          }
        });
      }
    };
    
    // Create snow animation
    const createSnowAnimation = () => {
      // Add light clouds
      for (let i = 0; i < cloudCount; i++) {
        createCloud();
      }
      
      // Add snowflakes
      for (let i = 0; i < snowflakeCount; i++) {
        const size = Math.random() * 5 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speed = Math.random() * 1 + 0.5;
        const swingAmount = Math.random() * 1.5 + 0.5;
        const swingSpeed = Math.random() * 0.02 + 0.01;
        const opacity = Math.random() * 0.5 + 0.5;
        
        elements.push({
          type: "snowflake",
          x,
          y,
          size,
          speed,
          swingAmount,
          swingSpeed,
          swingOffset: Math.random() * Math.PI * 2,
          opacity,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          draw: function() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            
            // Draw snowflake
            for (let i = 0; i < 6; i++) {
              ctx.save();
              ctx.rotate(i * Math.PI / 3);
              
              // Draw snowflake arm
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, this.size);
              ctx.lineWidth = this.size / 6;
              ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
              ctx.stroke();
              
              // Draw small branches
              const branchSize = this.size / 3;
              ctx.beginPath();
              ctx.moveTo(0, this.size * 0.3);
              ctx.lineTo(branchSize, this.size * 0.5);
              ctx.moveTo(0, this.size * 0.3);
              ctx.lineTo(-branchSize, this.size * 0.5);
              ctx.moveTo(0, this.size * 0.7);
              ctx.lineTo(branchSize, this.size * 0.9);
              ctx.moveTo(0, this.size * 0.7);
              ctx.lineTo(-branchSize, this.size * 0.9);
              ctx.stroke();
              
              ctx.restore();
            }
            
            ctx.restore();
          },
          update: function() {
            this.y += this.speed;
            this.x += Math.sin((this.y * this.swingSpeed) + this.swingOffset) * this.swingAmount;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height + this.size) {
              this.y = -this.size;
              this.x = Math.random() * canvas.width;
            } else if (this.x > canvas.width + this.size) {
              this.x = -this.size;
            } else if (this.x < -this.size) {
              this.x = canvas.width + this.size;
            }
          }
        });
      }
    };
    
    // Create storm animation
    const createStormAnimation = () => {
      // Add dark clouds
      for (let i = 0; i < cloudCount; i++) {
        const cloudWidth = Math.random() * 200 + 150;
        const cloudHeight = cloudWidth * 0.6;
        const x = Math.random() * (canvas.width + cloudWidth) - cloudWidth;
        const y = Math.random() * canvas.height * 0.5;
        const speed = Math.random() * 0.3 + 0.1;
        
        elements.push({
          type: "stormCloud",
          x,
          y,
          width: cloudWidth,
          height: cloudHeight,
          speed,
          lightningTimer: Math.random() * 200,
          lightningDuration: 0,
          opacity: Math.random() * 0.2 + 0.7,
          draw: function() {
            // Darker clouds for storms
            ctx.fillStyle = `rgba(70, 80, 90, ${this.opacity})`;
            
            // Draw cloud shape
            const radius = this.height / 2;
            ctx.beginPath();
            ctx.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            ctx.arc(this.x + this.width - radius, this.y + radius, radius, 0, Math.PI * 2);
            ctx.rect(this.x + radius, this.y, this.width - radius * 2, radius * 2);
            ctx.fill();
            
            // Add cloud details
            const detailRadius = radius * 0.7;
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.2, this.y, detailRadius, 0, Math.PI * 2);
            ctx.arc(this.x + this.width * 0.5, this.y - radius * 0.3, detailRadius * 1.2, 0, Math.PI * 2);
            ctx.arc(this.x + this.width * 0.8, this.y, detailRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw lightning if active
            if (this.lightningDuration > 0) {
              // Bright flash
              ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningDuration / 10})`;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Lightning bolt
              const startX = this.x + this.width * (0.3 + Math.random() * 0.4);
              const startY = this.y + this.height;
              
              ctx.strokeStyle = `rgba(255, 255, 240, ${0.7 + (this.lightningDuration / 10)})`;
              ctx.lineWidth = 2 + Math.random() * 2;
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              
              let currentX = startX;
              let currentY = startY;
              
              // Create zigzag lightning path
              const segments = 5 + Math.floor(Math.random() * 3);
              const maxHeight = canvas.height - startY;
              
              for (let i = 1; i <= segments; i++) {
                const nextY = startY + (maxHeight * i / segments);
                const nextX = currentX + (Math.random() - 0.5) * 30;
                
                // Add a branch occasionally
                if (Math.random() > 0.7 && i > 1 && i < segments - 1) {
                  const branchEndX = nextX + (Math.random() - 0.5) * 70;
                  const branchEndY = nextY + Math.random() * 50;
                  
                  ctx.moveTo(currentX, currentY);
                  ctx.lineTo(branchEndX, branchEndY);
                  ctx.moveTo(currentX, currentY);
                }
                
                ctx.lineTo(nextX, nextY);
                currentX = nextX;
                currentY = nextY;
              }
              
              ctx.stroke();
            }
          },
          update: function() {
            this.x += this.speed;
            if (this.x > canvas.width + this.width) {
              this.x = -this.width;
              this.y = Math.random() * canvas.height * 0.5;
            }
            
            // Lightning logic
            if (this.lightningDuration > 0) {
              this.lightningDuration--;
            } else {
              this.lightningTimer--;
              if (this.lightningTimer <= 0) {
                // Create new lightning
                this.lightningDuration = 5 + Math.floor(Math.random() * 5);
                this.lightningTimer = 50 + Math.random() * 200;
              }
            }
          }
        });
      }
      
      // Add heavy rain
      for (let i = 0; i < rainDropCount * 1.5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const length = Math.random() * 20 + 15;
        const speed = Math.random() * 20 + 20;
        const thickness = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.5 + 0.4;
        
        elements.push({
          type: "heavyRain",
          x,
          y,
          length,
          speed,
          thickness,
          opacity,
          angle: (Math.random() * 10 + 10) * (Math.PI / 180), // 10-20 degrees
          draw: function() {
            ctx.strokeStyle = `rgba(200, 220, 255, ${this.opacity})`;
            ctx.lineWidth = this.thickness;
            
            const cosAngle = Math.cos(this.angle);
            const sinAngle = Math.sin(this.angle);
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
              this.x + this.length * sinAngle,
              this.y + this.length * cosAngle
            );
            ctx.stroke();
          },
          update: function() {
            const cosAngle = Math.cos(this.angle);
            const sinAngle = Math.sin(this.angle);
            
            this.y += this.speed * cosAngle;
            this.x += this.speed * sinAngle;
            
            if (this.y > canvas.height) {
              this.y = -this.length;
              this.x = Math.random() * canvas.width;
            } else if (this.x > canvas.width) {
              this.x = -this.length;
            }
          }
        });
      }
    };
    
    // Create fog animation
    const createFogAnimation = () => {
      // Create fog clouds
      for (let i = 0; i < 10; i++) {
        const width = Math.random() * 400 + 300;
        const height = Math.random() * 200 + 100;
        const x = Math.random() * (canvas.width + width * 2) - width;
        const y = Math.random() * canvas.height;
        const speed = Math.random() * 0.2 + 0.1;
        const opacity = Math.random() * 0.1 + 0.1;
        
        elements.push({
          type: "fog",
          x,
          y,
          width,
          height,
          speed,
          opacity,
          draw: function() {
            const gradient = ctx.createRadialGradient(
              this.x + this.width / 2, this.y + this.height / 2, 0,
              this.x + this.width / 2, this.y + this.height / 2, this.width / 1.5
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(
              this.x + this.width / 2,
              this.y + this.height / 2,
              this.width / 2,
              this.height / 2,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          },
          update: function() {
            this.x += this.speed;
            if (this.x > canvas.width + this.width) {
              this.x = -this.width;
              this.y = Math.random() * canvas.height;
            }
          }
        });
      }
    };
    
    // Initialize animation
    setupAnimation();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update all elements
      elements.forEach(element => {
        element.draw();
        element.update();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, [weatherType, isDay]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default WeatherAnimation;
