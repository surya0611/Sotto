'use client';
import { useState } from 'react';

const faqs = [
  {
    question: "Does Sotto slow down my store?",
    answer: "No. The widget loads asynchronously and has no impact on your storefront's core performance metrics."
  },
  {
    question: "Is the purchase data real?",
    answer: "Yes. Sotto pulls only from verified sources — your actual Shopify orders, Razorpay transactions, or form submissions. No synthetic or estimated data."
  },
  {
    question: "What counts as an event?",
    answer: "One event is one widget impression shown to one visitor. A single visitor seeing three widgets in a session counts as three events."
  },
  {
    question: "How does it look on mobile?",
    answer: "All widget styles are fully responsive. You can preview mobile rendering in the dashboard before going live."
  },
  {
    question: "Can I customise how the widget looks?",
    answer: "Yes. Sotto ships with multiple visual style presets and lets you adjust position, timing, and frequency from the dashboard."
  }
];

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%', 
          background: 'none', 
          border: 'none', 
          textAlign: 'left', 
          cursor: 'pointer', 
          color: 'var(--fg)', 
          fontSize: '1.125rem', 
          fontWeight: 600,
          padding: '4px 0'
        }}
      >
        {question}
        <svg 
          width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--fg-subtle)' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div style={{ 
        maxHeight: isOpen ? '200px' : '0px', 
        overflow: 'hidden', 
        transition: 'max-height 0.3s ease',
        color: 'var(--fg-muted)', 
        fontSize: '1rem', 
        lineHeight: '1.6'
      }}>
        <div style={{ paddingTop: '12px', paddingRight: '24px' }}>
          {answer}
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="faq-section" style={{ padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>Frequently Asked Questions</h2>
      </div>
      <div className="" style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}
