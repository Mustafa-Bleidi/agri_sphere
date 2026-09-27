import React from 'react';

import { fqa_allUsers_questions, fqa_engineer_questions, fqa_equipment_questions, fqa_farmer_questions } from '../../../Data';

import Layout from '../../../components/common/Layout';
import CTAFooter from '../../../components/cta-footer/CtaFooter';
import Partners from '../../../components/partners/Partners';

import './fqa.css';

function FQA() {
    return (
        <Layout>

            {/* =============== FQA HEADER =============== */}
            <section className="header__fqa section">
                <div className="fqa__header__container container">
                    <h2 className="fqa__header-title">
                        frequently asked questions
                    </h2>

                    <h4 className="fqa__header-subtitle">
                        Topics
                    </h4>

                    <div className="fqa__header-filter flex">
                        <select 
                            name="fqa__topic" 
                            id="fqa__topic"
                            className='fqa__header-select'
                        >
                            <option value="#">All Topics</option>
                            <option value="#">For Farmers</option>
                            <option value="#">For Agricultural Engineers</option>
                            <option value="#">For Farm Equipment Owners (Dealers)</option>
                            <option value="#">For all users</option>
                        </select>

                        <select 
                            name="fqa__sort" 
                            id="fqa__sort"
                            className='fqa__header-select'
                        >
                            <option value="#">Newest to oldest</option>
                            <option value="#">Oldest to newest</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* =============== FQA QUESTIONS =============== */}
            <section className="fqa__questions">
                <div className="fqa__questions__container container flex">

                    <div className="fqa__questions-farmer">
                        <h5 className="fqa__questions-title">
                            For Farmers
                        </h5>

                        {
                            fqa_farmer_questions.map( ( { question, answer }, index ) => {
                                return (
                                    <div key={index} className='fqa__question'>
                                        <h6 className="fqa__question-question">
                                            { index + 1 }. {question}
                                        </h6>

                                        <p className="fqa__question-answer">
                                            {answer}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className="fqa__questions-engineer">
                        <h5 className="fqa__questions-title">
                            For Agricultural Engineers
                        </h5>

                        {
                            fqa_engineer_questions.map( ( { question, answer, answers }, index ) => {
                                return (
                                    <div key={index} className='fqa__question'>
                                        <h6 className="fqa__question-question">
                                            { index + 1 }. {question}
                                        </h6>

                                        <p className="fqa__question-answer">{answer}</p>

                                        {
                                            answers &&
                                            <div className="fqa__question-answers">
                                                {
                                                    answers.map( ( element, answerIndex ) => {
                                                        return (
                                                            <p key={answerIndex} className='fqa__question-answers-answer'>- {element}</p>
                                                        )
                                                    })
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className="fqa__questions-equipment">
                        <h5 className="fqa__questions-title">
                            For Farm Equipment Owners (Dealers)
                        </h5>

                        {
                            fqa_equipment_questions.map( ( { question, answer }, index ) => {
                                return (
                                    <div key={index} className='fqa__question'>
                                        <h6 className="fqa__question-question">
                                            { index + 1 }. {question}
                                        </h6>

                                        <p className="fqa__question-answer">
                                            {answer}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className="fqa__questions-equipment">
                        <h5 className="fqa__questions-title">
                            For all users
                        </h5>

                        {
                            fqa_allUsers_questions.map( ( { question, answer, answers }, index ) => {
                                return (
                                    <div key={index} className='fqa__question'>
                                        <h6 className="fqa__question-question">
                                            { index + 1 }. {question}
                                        </h6>

                                        {
                                            answer &&
                                                <p className="fqa__question-answer">{answer}</p>
                                        }

                                        {
                                            answers &&
                                            <div className="fqa__question-answer">
                                                {
                                                    answers.map( ( element, answerIndex ) => {
                                                        return (
                                                            <p key={answerIndex}>- {element}</p>
                                                        )
                                                    })
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>

            {/* =============== CTA-Footer =============== */}
            <CTAFooter />

            {/* =============== PARTNERS =============== */} 
            <Partners />
        </Layout>
    );
};

export default FQA;