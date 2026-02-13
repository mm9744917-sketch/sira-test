import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as THREE from "three";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const mountRef = useRef(null);

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Session
  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // ✅ THREE Background (Neural Sphere Cinematic)
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.pointerEvents = "none"; // ✅ مهم: ما يمنع الضغط على الأزرار
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const key = new THREE.PointLight(0xffffff, 1.2);
    key.position.set(6, 6, 6);
    scene.add(key);

    const rim = new THREE.PointLight(0xd4af37, 0.9);
    rim.position.set(-6, -2, 4);
    scene.add(rim);

    // Starfield (خلفية نقاط)
    const starCount = 900;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 30 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi) - 12;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.18,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Neural Sphere (Points)
    const sphereGeo = new THREE.SphereGeometry(1.55, 64, 64);
    const spherePointsMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.028,
      transparent: true,
      opacity: 0.95,
    });
    const spherePoints = new THREE.Points(sphereGeo, spherePointsMat);
    scene.add(spherePoints);

    // Wireframe Edges (Neural lines look)
    const edges = new THREE.EdgesGeometry(sphereGeo, 18);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.16,
    });
    const wire = new THREE.LineSegments(edges, edgesMat);
    scene.add(wire);

    // Core (نواة نابضة)
    const coreGeo = new THREE.SphereGeometry(0.48, 40, 40);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xd4af37,
      emissiveIntensity: 0.75,
      metalness: 0.6,
      roughness: 0.25,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Interaction (mouse + touch)
    let targetX = 0;
    let targetY = 0;

    const onMove = (x, y) => {
      targetX = (x / window.innerWidth) * 2 - 1;
      targetY = -((y / window.innerHeight) * 2 - 1);
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!e.touches?.[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      // Cinematic slow drift
      stars.rotation.y += 0.00035;

      // Smooth camera follow
      camera.position.x += (targetX * 0.55 - camera.position.x) * 0.035;
      camera.position.y += (targetY * 0.35 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);

      // Sphere motion
      spherePoints.rotation.y += 0.0022;
      wire.rotation.y += 0.0022;
      spherePoints.rotation.x = targetY * 0.25;
      wire.rotation.x = targetY * 0.25;

      // Core pulse
      const pulse = 1 + Math.sin(performance.now() * 0.003) * 0.08;
      core.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);

      // Dispose
      starGeo.dispose();
      starMat.dispose();
      sphereGeo.dispose();
      spherePointsMat.dispose();
      edges.dispose();
      edgesMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();

      // Remove canvas
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch {}
      }
    };
  }, []);

  // ✅ Auth actions
  const signInWithGoogle = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setMessage("Error: " + error.message);
  };

  const signInWithEmail = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setMessage("Error: " + error.message);
    else setMessage("✅ Check your email for login link 🚀");
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="page">
      <div ref={mountRef} className="threeMount" />

      <div className="card">
        <h1 className="title typing">SIRA AI</h1>

        {user ? (
          <>
            <p className="sub">✅ Logged in as:</p>
            <p className="email">{user.email}</p>
            <button className="btn gold" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="btn gold" onClick={signInWithEmail}>
              Continue with Email
            </button>

            <button className="btn outline" onClick={signInWithGoogle}>
              Continue with Google
            </button>

            <p className="msg">{message}</p>
          </>
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap");

        :root {
          --gold: #d4af37;
          --black: #000;
          --panel: rgba(10, 10, 10, 0.62);
          --panel2: rgba(0, 0, 0, 0.25);
        }

        body {
          margin: 0;
          background: var(--black);
          overflow: hidden;
          font-family: "Orbitron", system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }

        .threeMount {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none; /* ✅ ما يمنع الضغط */
        }

        .page {
          position: relative;
          height: 100vh;
          display: grid;
          place-items: center;
          z-index: 1;
        }

        .card {
          width: min(420px, 92vw);
          padding: 28px 22px;
          border-radius: 22px;
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border: 1px solid rgba(212, 175, 55, 0.25);
          box-shadow:
            0 0 60px rgba(212, 175, 55, 0.06),
            0 20px 80px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .title {
          margin: 0 0 20px;
          color: var(--gold);
          font-size: 56px;
          letter-spacing: 3px;
          text-shadow: 0 0 30px rgba(212, 175, 55, 0.35);
        }

        /* Typing effect */
        .typing {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid var(--gold);
          animation: typing 2.6s steps(14, end), blink 0.75s step-end infinite;
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 9ch; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }

        .sub {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.85);
          font-size: 13px;
        }

        .email {
          margin: 10px 0 18px;
          color: rgba(212, 175, 55, 0.95);
          font-size: 14px;
          word-break: break-word;
        }

        .input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 999px;
          border: 1px solid rgba(212, 175, 55, 0.55);
          background: rgba(17, 17, 17, 0.85);
          color: #fff;
          outline: none;
          text-align: center;
          margin-bottom: 14px;
        }

        .btn {
          width: 100%;
          padding: 14px 16px;
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .gold {
          border: none;
          color: #000;
          background: linear-gradient(45deg, #d4af37, #f6e58d);
          box-shadow: 0 0 0 rgba(212, 175, 55, 0);
          margin-bottom: 12px;
        }
        .gold:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.25);
        }

        .outline {
          border: 1px solid rgba(212, 175, 55, 0.75);
          background: rgba(17, 17, 17, 0.65);
          color: var(--gold);
        }
        .outline:hover {
          background: rgba(212, 175, 55, 0.92);
          color: #000;
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.22);
        }

        .msg {
          margin: 14px 0 0;
          color: rgba(212, 175, 55, 0.95);
          min-height: 18px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
