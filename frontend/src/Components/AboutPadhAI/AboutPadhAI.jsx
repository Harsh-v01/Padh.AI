import { useState } from 'react';

export default function AboutPadhAI() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <section className="about-padh-section">
        <div className="about-padh-container">

          {/* LEFT SIDE */}
          <div className="about-padh-content">

            <div className="about-padh-label">
              ABOUT PADH.AI
            </div>

            <h2 className="about-padh-title">
              Your AI-powered
              <span> study companion.</span>
            </h2>

            <p className="about-padh-description">
              Padh.AI is built for students who want to study smarter,
              not harder. Upload your notes, textbooks, or PDFs and turn
              your study material into an interactive learning experience.
            </p>

            <p className="about-padh-description">
              Instead of simply giving you answers, Padh.AI helps you
              understand what you're learning through summaries, quizzes,
              contextual conversations, and guided questions.
            </p>

            <button
              className="about-padh-button"
              onClick={() => setShowAbout(true)}
            >
              Explore Padh.AI
              <span>→</span>
            </button>

          </div>

          {/* RIGHT SIDE — FEATURES */}
          <div className="about-padh-features">

            <div className="about-padh-feature">
              <div className="about-padh-icon teal">
                📄
              </div>

              <div>
                <h3>Smart Summaries</h3>
                <p>
                  Turn lengthy study material into clear,
                  concise notes.
                </p>
              </div>
            </div>

            <div className="about-padh-feature">
              <div className="about-padh-icon green">
                ?
              </div>

              <div>
                <h3>Interactive Quizzes</h3>
                <p>
                  Test yourself using questions generated
                  from your own material.
                </p>
              </div>
            </div>

            <div className="about-padh-feature">
              <div className="about-padh-icon purple">
                🧠
              </div>

              <div>
                <h3>Conceptual Learning</h3>
                <p>
                  Understand concepts through guided questions
                  instead of just memorizing answers.
                </p>
              </div>
            </div>

            <div className="about-padh-feature">
              <div className="about-padh-icon blue">
                ✦
              </div>

              <div>
                <h3>AI Assistant</h3>
                <p>
                  Ask questions about your uploaded material
                  and get contextual answers.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT MODAL */}
      {showAbout && (
        <div
          className="about-padh-overlay"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="about-padh-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="about-padh-close"
              onClick={() => setShowAbout(false)}
            >
              ×
            </button>

            <div className="about-padh-brand">
              <span>Padh</span>
              <b>.</b>
              <em>AI</em>
            </div>

            <h2>
              Your AI-powered study companion
            </h2>

            <p className="about-padh-modal-description">
              Padh.AI is built for students who want to study
              smarter, not harder.
            </p>

            <div className="about-padh-modal-features">

              <div>
                <span>01</span>
                <section>
                  <strong>Smart Summaries</strong>
                  <p>
                    Instantly condense lengthy documents into
                    clear and useful study notes.
                  </p>
                </section>
              </div>

              <div>
                <span>02</span>
                <section>
                  <strong>Interactive Quizzes</strong>
                  <p>
                    Practice and test your knowledge using
                    questions generated from your material.
                  </p>
                </section>
              </div>

              <div>
                <span>03</span>
                <section>
                  <strong>Conceptual Learning</strong>
                  <p>
                    Think deeper and connect ideas through
                    AI-guided questions.
                  </p>
                </section>
              </div>

              <div>
                <span>04</span>
                <section>
                  <strong>AI Assistant</strong>
                  <p>
                    Ask questions about your uploaded material
                    and receive contextual answers.
                  </p>
                </section>
              </div>

            </div>

            <div className="about-padh-modal-footer">
              Built for students. Designed to help you understand,
              not just memorize.
            </div>

          </div>
        </div>
      )}

      <style>{`
        .about-padh-section {
          width: 100%;
          padding: 80px 60px;
          background: #0b1018;
          color: white;
        }

        .about-padh-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 80px;
          align-items: center;
        }

        .about-padh-label {
          color: #2DD4BF;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 18px;
        }

        .about-padh-title {
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1.1;
          margin: 0 0 24px;
          font-weight: 800;
        }

        .about-padh-title span {
          display: block;
          color: #2DD4BF;
        }

        .about-padh-description {
          color: rgba(255,255,255,0.62);
          font-size: 15px;
          line-height: 1.8;
          max-width: 600px;
          margin-bottom: 14px;
        }

        .about-padh-button {
          margin-top: 18px;
          padding: 13px 20px;
          border: 1px solid rgba(45,212,191,0.35);
          border-radius: 10px;
          background: rgba(45,212,191,0.08);
          color: #2DD4BF;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .about-padh-button span {
          margin-left: 10px;
          font-size: 18px;
        }

        .about-padh-button:hover {
          background: rgba(45,212,191,0.15);
          transform: translateY(-2px);
        }

        .about-padh-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-padh-feature {
          display: flex;
          gap: 18px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          background: rgba(255,255,255,0.025);
          transition: 0.2s;
        }

        .about-padh-feature:hover {
          border-color: rgba(45,212,191,0.25);
          transform: translateX(4px);
        }

        .about-padh-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 21px;
          font-weight: 800;
        }

        .about-padh-icon.teal {
          background: rgba(45,212,191,0.12);
        }

        .about-padh-icon.green {
          background: rgba(74,222,128,0.12);
        }

        .about-padh-icon.purple {
          background: rgba(167,139,250,0.12);
        }

        .about-padh-icon.blue {
          background: rgba(14,165,233,0.12);
        }

        .about-padh-feature h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .about-padh-feature p {
          margin: 0;
          color: rgba(255,255,255,0.48);
          font-size: 13px;
          line-height: 1.55;
        }

        /* MODAL */

        .about-padh-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(7px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .about-padh-modal {
          position: relative;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 42px;
          border-radius: 24px;
          background: #0f141e;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 30px 90px rgba(0,0,0,0.65),
            0 0 0 1px rgba(45,212,191,0.07);
        }

        .about-padh-close {
          position: absolute;
          top: 16px;
          right: 18px;
          border: none;
          background: none;
          color: rgba(255,255,255,0.45);
          font-size: 25px;
          cursor: pointer;
        }

        .about-padh-close:hover {
          color: white;
        }

        .about-padh-brand {
          margin-bottom: 18px;
          font-size: 28px;
          font-weight: 800;
        }

        .about-padh-brand span {
          color: #FACC15;
        }

        .about-padh-brand b {
          color: white;
        }

        .about-padh-brand em {
          color: #D9D9D9;
          font-style: normal;
        }

        .about-padh-modal h2 {
          margin: 0 0 12px;
          color: white;
          font-size: 25px;
        }

        .about-padh-modal-description {
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .about-padh-modal-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .about-padh-modal-features > div {
          display: flex;
          gap: 18px;
        }

        .about-padh-modal-features > div > span {
          color: #2DD4BF;
          font-size: 12px;
          font-weight: 800;
          padding-top: 3px;
        }

        .about-padh-modal-features strong {
          display: block;
          color: white;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .about-padh-modal-features p {
          margin: 0;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          line-height: 1.6;
        }

        .about-padh-modal-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          text-align: center;
          color: rgba(255,255,255,0.35);
          font-size: 13px;
        }

        @media (max-width: 800px) {
          .about-padh-section {
            padding: 60px 24px;
          }

          .about-padh-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-padh-modal {
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
}