import React from 'react';
import { Link } from 'react-router-dom';
import { backgroundImages } from '../data/backgroundImages';
import './Home.css';

export default function Home() {
    // Split 100 images into 5 arrays of 20, then duplicate to create seamless infinite scrolling
    const row1 = [...backgroundImages.slice(0, 20), ...backgroundImages.slice(0, 20)];
    const row2 = [...backgroundImages.slice(20, 40), ...backgroundImages.slice(20, 40)];
    const row3 = [...backgroundImages.slice(40, 60), ...backgroundImages.slice(40, 60)];
    const row4 = [...backgroundImages.slice(60, 80), ...backgroundImages.slice(60, 80)];
    const row5 = [...backgroundImages.slice(80, 100), ...backgroundImages.slice(80, 100)];

    // Randomize speeds and starting delays slightly for a more organic feel
    const createRowStyle = () => ({
        animationDuration: `${120 + Math.random() * 40}s`,
        animationDelay: `-${Math.random() * 120}s`
    });

    return (
        <div className="home-container">
            {/* Animated Background */}
            <div className="background-wrapper">
                <div className="card-row" style={createRowStyle()}>
                    {row1.map((src, idx) => (
                        <img key={`r1-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row" style={createRowStyle()}>
                    {row2.map((src, idx) => (
                        <img key={`r2-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row" style={createRowStyle()}>
                    {row3.map((src, idx) => (
                        <img key={`r3-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row" style={createRowStyle()}>
                    {row4.map((src, idx) => (
                        <img key={`r4-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row" style={createRowStyle()}>
                    {row5.map((src, idx) => (
                        <img key={`r5-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
            </div>

            {/* Hero Content Overlay */}
            <div className="hero-content glass-panel">
                <h1 className="hero-title">Welcome to Chase TCG</h1>
                <h2 className="hero-subtitle">The ultimate destination for premium Pokemon collectibles.</h2>

                <p className="hero-story">
                    Born from a passion for the thrill of the pull, Chase TCG was founded on a simple premise:
                    Provide collectors with the absolute pinnacle of genuine Pokemon Trading Card Game products.
                    From flawless graded vintage holos to factory-fresh modern booster boxes, we source only
                    the highest quality inventory. Whether you're hunting for Moonbreon, chasing that elusive Base
                    Set Charizard, or just looking to crack some packs with friends—your chase starts here.
                </p>

                <Link to="/shop" className="cta-button">
                    Enter the Storefront
                </Link>
            </div>
        </div>
    );
}
