import React from 'react';

import { engineer__coreTools_data, engineer_howItWorks_data } from '../../../Data';

import Layout from '../../../components/common/Layout';
import SectionTitle from '../../../components/title/SectionTitle';
import HowItWorks from '../../../components/how-it-works/HowItWorks';
import CTAFooter from '../../../components/cta-footer/CtaFooter';
import Partners from '../../../components/partners/Partners';
import { useAuthModal } from '../../../context/AuthModalContext';

import FarmerImage from '../../../assets/farmer.jpg';

import './engineer.css';

function Engineer() {
    const { openLogin, openRegister } = useAuthModal();

    return (
        <Layout>

            {/* =============== HERO =============== */}
            <section className="hero__engineer section">
                <div className="hero__engineer__container grid">
                    <div className="hero__engineer-content">
                        <h1 className="hero__engineer-title">
                            Empowering Agricultural Engineers 
                        </h1>

                        <p className="hero__engineer-description">
                            Connect with farmers and agribusinesses to deliver data-driven, scalable solutions — and grow your impact.
                            <br />
                            Partner with us to provide personalized consultations, smart inventory strategies, 
                            and actionable insights that maximize farm productivity — while building your professional network and reputation.
                        </p>

                        <div className="hero__engineer-buttons">
                            <button type="button" className='hero__engineer-singup-btn' onClick={() => openRegister('engineer')}>
                                Sign Up
                            </button>

                            <button type="button" className='hero__engineer-singin-btn' onClick={() => openLogin()}>
                                Log In
                            </button>
                        </div>
                    </div>

                    <div className="hero__engineer-image-wrapper">
                        <img 
                            src={FarmerImage}
                            alt="Farmer Image" 
                            className='hero__engineer-img'
                        />
                    </div>
                </div>
            </section>

            {/* =============== CORE TOOLS =============== */}
            <section className="coreTools__engineer">
                <SectionTitle
                    title='the core tools for engineering sustainable impact'
                    description={
                        'Everything you need to optimize your agronomic expertise, deliver exceptional service, and build a successful practice.'
                    }
                />

                <div className="coreTools__engineer__container container flex">
                    {
                        engineer__coreTools_data.map( ( { icon, title, description }, index) => {
                            return (
                                <div key={index} className="coreTools__engineer-card">
                                    <div className="coreTools__engineer-icon-wrapper">
                                        <img 
                                            src={icon}
                                            alt={`Engineer-CoreTools-Card-Icon-${index + 1}`}
                                            className="coreTools__engineer-card-icon" 
                                        />
                                    </div>

                                    <h6 className="coreTools__engineer-card-title">
                                        {title}
                                    </h6>

                                    <p className="coreTools__engineer-card-description">
                                        {description}
                                    </p>
                                </div>
                            )
                        })
                    }
                </div>
            </section>

            {/* =============== HOW IT WORKS =============== */}
            <section className="howItWorks__engineer">
                <HowItWorks data={engineer_howItWorks_data} />
            </section>

            {/* =============== CTA-Footer =============== */}
            <CTAFooter />

            {/* =============== PARTNERS =============== */} 
            <Partners />
        </Layout>
    );
};

export default Engineer;