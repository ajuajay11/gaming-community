"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Home as HomeIcon, Compass, Plus, MessageSquare, User, Bell, Search, Wallet, ShoppingCart, Tag, ArrowRight } from "lucide-react";
import Logo from "@/public/images/ssss.png";
export default function Home() {
  const signIn = true;
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "chat" | "profile">("home");
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      <header className="bg-[#0f1114] text-white">
        <div className="container mx-auto flex justify-between items-center px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={Logo}
              alt="Gaming Federation"
              width={80}
              height={48}
              className=" rounded-xl"
              priority
            />

          </Link>

          {!signIn ? (
            <Link
              href="/login"
              className="bg-secondary text-primary px-4 py-2 rounded-md font-semibold"
            >
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="relative w-10 h-10 rounded-full bg-[#1a1d22] flex items-center justify-center hover:bg-[#24282f] transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                <span
                  aria-label="unread notifications"
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0f1114]"
                />
              </button>
              <Link
                href="/profile"
                aria-label="Profile"
                className="w-10 h-10 rounded-full ring-2 ring-cyan-400 overflow-hidden bg-[#1a1d22] flex items-center justify-center"
              >
                <User className="w-5 h-5 text-gray-300" />
              </Link>
            </div>
          )}
        </div>

        <div className="container mx-auto px-5 pb-4">
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-3 bg-[#1a1d22] rounded-xl px-4 h-12 focus-within:ring-2 focus-within:ring-cyan-400 transition">
              <Search className="  h-5 text-gray-400 shrink-0" />
              <input
                type="search"
                placeholder="Search PUBG, PES..."
                aria-label="Search games"
                className="bg-transparent outline-none w-full text-sm text-white placeholder:text-gray-500"
              />
            </label>

          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 pt-4 pb-28">

        <section className="hero">

           <div className="hero-header">
            <h2>
              ELITE
              <span className="gradient-text"> X</span>
            </h2>
            <div className="hero-subheader">
              <span className="divider divider-left"></span>
              KERALA
              <span className="divider divider-right"></span>
            </div>
          </div>

          <div className="games-container">

            <div className="game-item gta-v">
              <div className="glow"></div>
              <span className="game-name">GTA V</span>
              <img src="/images/gta_v_character.png" alt="GTA V character" />
            </div>

            <div className="game-item pubg">
              <div className="glow"></div>
              <span className="game-name">PUBG</span>
              <img src="/images/pubg_character.png" alt="PUBG character" />
            </div>

            <div className="game-item valorant">
              <div className="glow"></div>
              <span className="game-name">VALORANT</span>
              <img src="/images/fortnite_character.png" alt="VALORANT character" />
            </div>

            <div className="game-item free-fire">
              <div className="glow"></div>
              <span className="game-name">FREE FIRE</span>
              <img src="/images/free_fire_character.png" alt="FREE FIRE character" />
            </div>

            <div className="game-item football">
              <div className="glow"></div>
              <span className="game-name">FOOTBALL</span>
              <img src="/images/pes2025.png" alt="FOOTBALL character" />
            </div>

          </div>

           <div className="hero-footer">
            <h3>Premium Gaming IDs</h3>
            <p>
              Verified <span className="divider">•</span> Instant Transfer
              <span className="divider">•</span> 100% Secure
            </p>
          </div>

           <div className="hero-buttons">
            <a href="/buy" className="hero-button buy-btn">
              
              Buy Now
            </a>
            <a href="/sell" className="hero-button sell-btn">
              <Tag className="w-5 h-5" />
              Sell ID
            </a>
          </div>

        </section>

         <div className="feature-cards">

           <a href="/buy" className="feature-card buy-card">
            <div className="icon">
              <svg> </svg>
            </div>
            <h4>Buy Account</h4>
            <div className="card-footer">
              <span>Find your dream ID</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </a>

          <a href="/sell" className="feature-card sell-card">
            <div className="icon">
              <Tag className="w-5 h-5" />
            </div>
            <h4>Sell Account</h4>
            <div className="card-footer">
              <span>Get instant cash</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </a>

        </div>

      </main>
      {isMobile ? (
        <nav
          aria-label="Primary"
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1114] text-white rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
        >
          <ul className="relative grid grid-cols-5 items-end h-16 px-2">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                aria-current={activeTab === "home" ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 w-full h-16"
              >
                <HomeIcon
                  className={`w-6 h-6 ${activeTab === "home" ? "text-cyan-400 fill-cyan-400" : "text-gray-400"}`}
                />
                <span className={`text-xs ${activeTab === "home" ? "text-cyan-400 font-semibold" : "text-gray-400"}`}>
                  Home
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("explore")}
                aria-current={activeTab === "explore" ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 w-full h-16"
              >
                <Compass
                  className={`w-6 h-6 ${activeTab === "explore" ? "text-cyan-400" : "text-gray-400"}`}
                />
                <span className={`text-xs ${activeTab === "explore" ? "text-cyan-400 font-semibold" : "text-gray-400"}`}>
                  Explore
                </span>
              </button>
            </li>
            <li className="flex justify-center">
              <button
                type="button"
                aria-label="Create"
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white hover:bg-gray-200 text-primary flex items-center justify-center shadow-lg ring-4 ring-[#0f1114] transition-colors"
              >
                <Plus className="w-7 h-7" strokeWidth={3} />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                aria-current={activeTab === "chat" ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 w-full h-16"
              >
                <span className="relative">
                  <MessageSquare
                    className={`w-6 h-6 ${activeTab === "chat" ? "text-cyan-400" : "text-gray-400"}`}
                  />
                  <span
                    aria-label="unread messages"
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0f1114]"
                  />
                </span>
                <span className={`text-xs ${activeTab === "chat" ? "text-cyan-400 font-semibold" : "text-gray-400"}`}>
                  Chat
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                aria-current={activeTab === "profile" ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 w-full h-16"
              >
                <User
                  className={`w-6 h-6 ${activeTab === "profile" ? "text-cyan-400" : "text-gray-400"}`}
                />
                <span className={`text-xs ${activeTab === "profile" ? "text-cyan-400 font-semibold" : "text-gray-400"}`}>
                  Profile
                </span>
              </button>
            </li>
          </ul>
        </nav>
      ) : (
        <footer className="fixed bottom-0 w-full bg-primary text-secondary">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={100} height={100} className="w-10 h-10" />
            </Link>
            <p>Copyright 2026 Gaming Federation</p>
          </div>
        </footer>
      )}
    </>
  );
}
