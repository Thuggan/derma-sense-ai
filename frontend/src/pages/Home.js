import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import featureImage1 from "../assets/Camera.png";
import featureImage2 from "../assets/Check Document.png";
import featureImage3 from "../assets/Financial Growth Analysis.png";
import ScrollReveal from "../components/ScrollReveal";

const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      constructor(x, y, dx, dy, size) {
        this.x = x; this.y = y;
        this.dx = dx; this.dy = dy;
        this.size = size;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }
    }

    const init = () => {
      particlesArray = [];
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 2) + 1;
        const x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
        const dx = (Math.random() - 0.5) * 1;
        const dy = (Math.random() - 0.5) * 1;
        particlesArray.push(new Particle(x, y, dx, dy, size));
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dist = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                     ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
          if (dist < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (dist / 20000);
            ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', handleResize);

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" />;
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <ParticleNetwork />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="badge">✨ Next-Generation Healthcare</div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="hero-title">
              Detect skin conditions with <span className="gradient-text">extreme precision</span>.
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.3}>
            <p className="hero-description">
              Upload an image of your skin and our advanced AI instantly analyzes it for bacterial and fungal conditions like cellulitis, impetigo, and ringworm with over 90% accuracy.
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.4}>
             <button className="primary-button glowing" onClick={() => navigate('/QuickCheck')}>
              Start Free Diagnosis
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* How it works */}
      <section className="features-section">
        <ScrollReveal direction="up" delay={0}>
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to understand your skin health.</p>
          </div>
        </ScrollReveal>

        <div className="features-grid">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="feature-card" onClick={() => navigate('/quickcheck')}>
              <div className="feature-icon-wrapper">
                <img src={featureImage1} alt="Upload" />
              </div>
              <h3>1. Upload Photo</h3>
              <p>Snap a clear picture of the affected skin area. Secure and completely private.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <div className="feature-card" onClick={() => navigate('/quickcheck')}>
              <div className="feature-icon-wrapper">
                <img src={featureImage2} alt="AI analysis" />
              </div>
              <h3>2. AI Analysis</h3>
              <p>Our deep learning models scan for visual patterns spanning multiple diseases in seconds.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <div className="feature-card" onClick={() => navigate('/quickcheck')}>
              <div className="feature-icon-wrapper">
                <img src={featureImage3} alt="Results" />
              </div>
              <h3>3. Instant Results</h3>
              <p>Receive detailed confidence scores, treatment insights, and medical recommendations.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About Section */}
      <section className="about-interactive">
        <div className="about-content">
           <ScrollReveal direction="left" delay={0.1} distance="100px">
              <div className="about-text">
                <h2>Built for accuracy. <br/>Designed for privacy.</h2>
                <p>DermaSense AI leverages convolutional neural networks trained on millions of dermatological images. We empower you to take charge of your health from the comfort of your home—all while strictly protecting your data.</p>
                <div className="stats-row">
                   <div className="stat"><h2>92%</h2><p>Accuracy Rate</p></div>
                   <div className="stat"><h2>&lt; 3s</h2><p>Analysis Speed</p></div>
                   <div className="stat"><h2>10k+</h2><p>Images Analyzed</p></div>
                </div>
              </div>
           </ScrollReveal>
           
           <ScrollReveal direction="right" delay={0.3} distance="100px">
              <div className="about-visual">
                 <div className="glass-card">
                   <img src={featureImage2} alt="AI Core" />
                   <div className="processing-bar"></div>
                 </div>
              </div>
           </ScrollReveal>
        </div>
      </section>
      
      {/* CTA Footer */}
      <section className="cta-footer">
         <ScrollReveal direction="up" delay={0.1}>
           <h2>Ready to scan?</h2>
           <p>Get instant insights on your skin condition now.</p>
           <button className="primary-button" onClick={() => navigate('/quickcheck')}>Try Quick Check</button>
         </ScrollReveal>
      </section>
    </div>
  );
};

export default Home;