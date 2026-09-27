import React from 'react';
import { Link } from 'react-router';

import { equipment_features_data1, equipment_features_data2, equipment_howItWorks_data } from '../../../Data';

import Layout from '../../../components/common/Layout';
import SectionTitle from '../../../components/title/SectionTitle';
import HowItWorks from '../../../components/how-it-works/HowItWorks';
import CTAFooter from '../../../components/cta-footer/CtaFooter';
import Partners from '../../../components/partners/Partners';
import { useAuthModal } from '../../../context/AuthModalContext';

import CropsImage from '../../../assets/corps.jpg';
import ForestImage from '../../../assets/forest.jpg';

import './equipment.css';

function Equipment() {
    const { openLogin, openRegister } = useAuthModal();

    return (
        <Layout>
            {/* =============== HERO =============== */}
            <section className="hero__equipment section">
                <div className="hero__equipment__container container grid">
                    <h1 className="hero__equipment-title">
                        Empower Your Dealership. Connect with Farmers.
                    </h1>

                    <p className="hero__equipment-description">
                        Join our platform to increase equipment rentals, streamline maintenance, and grow your business.
                    </p>

                    <div className="hero__equipment-buttons">
                        <button type="button" className='hero__equipment-singin-btn' onClick={() => openLogin()}>
                            Log In
                        </button>

                        <button type="button" className='hero__equipment-singup-btn' onClick={() => openRegister('dealer')}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </section>

            {/* =============== FEATURES =============== */}
            <section className="features__equipment">
                <SectionTitle
                    subtitle='complete solution'
                    title='powerful features for dealers'
                    description={
                        'Everything you need to manage your agricultural equipment business efficiently and profitably.'
                    }
                />

                <div className="features__equipment__container flex">
                    <div className="features__equipment__wrapper">
                        <div className="features__equipment-image-wrapper">
                            <img 
                                src={CropsImage}
                                alt="Crops Image"
                                className='features__equipment-img' 
                            />
                        </div>

                        <div className="features__equipment-content">
                            {
                                equipment_features_data1.map( ( { icon, title, description }, index) => {
                                    return (
                                        <div key={index} className="features__equipment-info">
                                            <div key={index} className="features__equipment-icon-wrapper">
                                                <img 
                                                    src={icon}
                                                    alt={`Equipment-Featrues-Icon-${index + 1}`}
                                                    className="features__equipment-icon" 
                                                />
                                            </div>

                                            <div className="features__equipment-data">
                                                <h6 className="features__equipment-title">
                                                    {title}
                                                </h6>

                                                <p className="features__equipment-description">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <div className="features__equipment__wrapper">
                        <div className="features__equipment-content">
                            {
                                equipment_features_data2.map( ( { icon, title, description }, index) => {
                                    return (
                                        <div key={index} className="features__equipment-info">
                                            <div key={index} className="features__equipment-icon-wrapper">
                                                <img 
                                                    src={icon}
                                                    alt={`Equipment-Featrues-Icon-${index + 1}`}
                                                    className="features__equipment-icon" 
                                                />
                                            </div>

                                            <div className="features__equipment-data">
                                                <h6 className="features__equipment-title">
                                                    {title}
                                                </h6>

                                                <p className="features__equipment-description">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className="features__equipment-image-wrapper">
                            <img 
                                src={ForestImage}
                                alt="Forest Image"
                                className='features__equipment-img' 
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* =============== HOW IT WORKS =============== */}
            <section className="howItWorks__equipment">
                <HowItWorks data={equipment_howItWorks_data} />
            </section>
            
            {/* =============== CTA-Footer =============== */}
            <CTAFooter />

            {/* =============== PARTNERS =============== */} 
            <Partners />
        </Layout>
    );
};

export default Equipment;