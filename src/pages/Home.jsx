import React from 'react';
import { Link } from 'react-router-dom';
import { backgroundImages } from '../data/backgroundImages';
import './Home.css';

export default function Home() {
    // Create duplicated arrays to ensure seamless infinite scrolling animation
    const row1 = [...backgroundImages.slice(0, 10), ...backgroundImages.slice(0, 10)];
    const row2 = [...backgroundImages.slice(10, 20), ...backgroundImages.slice(10, 20)];
    const row3 = [...backgroundImages.slice(20, 30), ...backgroundImages.slice(20, 30)];
    const row4 = [...backgroundImages.slice(30, 40), ...backgroundImages.slice(30, 40)];
    const row5 = [...backgroundImages.slice(40, 50), ...backgroundImages.slice(40, 50)];

    return (
        <div className="home-container">
            {/* Animated Background */}
            <div className="background-wrapper">
                <div className="card-row">
                    {row1.map((src, idx) => (
                        <img key={`r1-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row">
                    {row2.map((src, idx) => (
                        <img key={`r2-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row">
                    {row3.map((src, idx) => (
                        <img key={`r3-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row">
                    {row4.map((src, idx) => (
                        <img key={`r4-${idx}`} src={src} className="bg-card" alt="Pokemon card background" loading="lazy" />
                    ))}
                </div>
                <div className="card-row">
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
