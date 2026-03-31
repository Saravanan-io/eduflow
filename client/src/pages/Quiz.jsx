import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import { Trophy, CheckCircle2, XCircle, ChevronRight, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Mock Quiz Questions (as per requirements, should be course-specific but static for now)
  const questions = [
    {
      question: "What is the primary role of a MERN stack developer?",
      options: ["Full-stack development", "Graphic design", "Database only", "Frontend only"],
      answer: 0
    },
    {
      question: "Which hook is used for side effects in React?",
      options: ["useState", "useContext", "useEffect", "useReducer"],
      answer: 2
    },
    {
      question: "What does JWT stand for?",
      options: ["Java Web Token", "JSON Web Token", "Just Web Token", "Joined Web Tool"],
      answer: 1
    }
  ];

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (socket) {
      socket.on('quiz_result', (data) => {
        setQuizResult(data);
      });
      return () => socket.off('quiz_result');
    }
  }, [socket]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${courseId}`);
      setCourse(data.course);
    } catch (err) {
      console.error('Error fetching course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      const finalScore = Math.round(((score + (selectedOption === questions[currentQuestion].answer ? 1 : 0)) / questions.length) * 100);
      setShowResult(true);
      if (socket) {
        socket.emit('quiz_submitted', { courseId, score: finalScore, feedback: `You scored ${finalScore}%` });
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container flex flex-col items-center justify-center py-10" style={{ minHeight: '80vh' }}>
      {!quizStarted ? (
        <div className="card glass text-center flex flex-col gap-6" style={{ maxWidth: '600px', padding: '3rem' }}>
          <div className="flex items-center justify-center p-4" style={{ background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', width: '100px', height: '100px', margin: '0 auto' }}>
            <HelpCircle size={48} color="var(--primary)" />
          </div>
          <h1>{course?.title} Final Quiz</h1>
          <p style={{ color: 'var(--text-muted)' }}>This quiz consists of {questions.length} questions. You need at least 80% to earn your completion badge.</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => setQuizStarted(true)} className="btn-primary" style={{ padding: '1rem' }}>Start Quiz Now</button>
            <button onClick={() => navigate(-1)} className="btn-outline">Go Back</button>
          </div>
        </div>
      ) : showResult ? (
        <div className="card glass text-center flex flex-col gap-6" style={{ maxWidth: '600px', padding: '3rem' }}>
          <div className="flex items-center justify-center" style={{ width: '120px', height: '120px', background: score >= questions.length * 0.8 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', margin: '0 auto' }}>
            {score >= questions.length * 0.8 ? <Trophy size={64} color="var(--accent)" /> : <AlertCircle size={64} color="var(--error)" />}
          </div>
          <h2 style={{ fontSize: '2rem' }}>{score >= questions.length * 0.8 ? 'Congratulations!' : 'Keep Practicing!'}</h2>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your Score</p>
            <p style={{ fontSize: '3rem', fontWeight: 800, color: score >= questions.length * 0.8 ? 'var(--accent)' : 'var(--error)' }}>
              {Math.round((score / questions.length) * 100)}%
            </p>
            <p style={{ color: 'var(--text-muted)' }}>{score} out of {questions.length} correct</p>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>{quizResult?.message || (score >= questions.length * 0.8 ? "Excellent! You've mastered this course." : "Don't worry, you can retake the quiz anytime.")}</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '1rem' }}>Finish & Return to Dashboard</button>
            <button 
              onClick={() => {
                setQuizStarted(false); setCurrentQuestion(0); setScore(0); setShowResult(false); setSelectedOption(null);
              }} 
              className="btn-outline flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card glass" style={{ width: '100%', maxWidth: '700px', padding: '3rem' }}>
          <div className="flex items-center justify-between mb-8">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>QUESTION {currentQuestion + 1} OF {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} style={{ width: '30px', height: '6px', background: i <= currentQuestion ? 'var(--primary)' : 'var(--glass-border)', borderRadius: '10px', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{questions[currentQuestion].question}</h2>

          <div className="flex flex-col gap-4">
            {questions[currentQuestion].options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`glass flex items-center justify-between text-left p-5 transition-all ${selectedOption === i ? 'selected' : ''}`}
                style={{
                  borderRadius: '15px',
                  border: selectedOption === i ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                  background: selectedOption === i ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-4">
                  <span style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: selectedOption === i ? 'var(--primary)' : 'var(--glass-border)',
                    display: 'flex', itemsCenter: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem'
                  }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ fontWeight: 500 }}>{opt}</span>
                </div>
                {selectedOption === i && <CheckCircle2 size={24} color="var(--primary)" />}
              </button>
            ))}
          </div>

          <button 
            onClick={handleNext} 
            disabled={selectedOption === null}
            className="btn-primary flex items-center justify-center gap-2 mt-10" 
            style={{ width: '100%', padding: '1rem' }}
          >
            <span>{currentQuestion + 1 === questions.length ? 'Submit Quiz' : 'Next Question'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style>{`
        .selected { transform: scale(1.02); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
      `}</style>
    </div>
  );
};

export default Quiz;
