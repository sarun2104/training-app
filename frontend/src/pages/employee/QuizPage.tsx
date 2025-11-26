import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import { Question, QuizAnswer } from '@/types';

export const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (courseId) {
      loadQuiz();
    }
  }, [courseId]);

  const loadQuiz = async () => {
    try {
      const data = await employeeService.getQuizQuestions(courseId!);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleCheckboxChange = (questionId: string, option: string) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleSubmit = async () => {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_answer: selectedOption as any,
      })
    );

    if (quizAnswers.length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const quizResult = await employeeService.submitQuiz(courseId!, {
        answers: quizAnswers,
      });
      setResult(quizResult);
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to submit quiz';
      alert(`Failed to submit quiz: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    loadQuiz();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            {result.passed ? (
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Congratulations!' : 'Not Passed'}
            </h2>

            <p className="text-gray-600 mb-6">
              You scored {result.score}%
              {result.passed
                ? ' - You have successfully completed this quiz!'
                : ' - You need at least 50% to pass.'}
            </p>

            {result.correct_answers !== undefined && (
              <p className="text-gray-600 mb-6">
                Correct Answers: {result.correct_answers} / {result.total_questions}
              </p>
            )}

            {result.attempt_number && (
              <p className="text-sm text-gray-500 mb-6">
                Attempt #{result.attempt_number}
              </p>
            )}

            <div className="flex justify-center space-x-4">
              <Button variant="secondary" onClick={() => navigate(`/employee/courses/${courseId}`)}>
                <ArrowLeft size={20} className="mr-2" />
                Back to Course
              </Button>
              {!result.passed && (
                <Button onClick={handleRetry}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileQuestion className="h-6 w-6 text-primary-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Course Assessment</h1>
            </div>
            <div className="text-sm text-gray-600">
              {answeredCount} of {totalQuestions} answered
            </div>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">No questions available for this course.</p>
              <Button variant="secondary" className="mt-4" onClick={() => navigate(`/employee/courses/${courseId}`)}>
                <ArrowLeft size={20} className="mr-2" />
                Back to Course
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigator */}
            <div className="lg:col-span-1">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.question_id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                        currentQuestionIndex === index
                          ? 'bg-primary-600 text-white'
                          : answers[q.question_id]
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-gray-100 mr-2"></div>
                      <span className="text-gray-600">Not Answered</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded bg-primary-600 mr-2"></div>
                      <span className="text-gray-600">Current</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Question Display */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                    {currentQuestion.multiple_answer_flag && (
                      <span className="ml-2 text-primary-600 font-medium">(Select all that apply)</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentQuestion.question_text}
                  </h2>
                </div>

                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question];
                    const isMultipleAnswer = currentQuestion.multiple_answer_flag;
                    const currentAnswers = answers[currentQuestion.question_id];
                    const isSelected = isMultipleAnswer
                      ? Array.isArray(currentAnswers) && currentAnswers.includes(option)
                      : currentAnswers === option;

                    return (
                      <label
                        key={option}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type={isMultipleAnswer ? "checkbox" : "radio"}
                          name={!isMultipleAnswer ? `question-${currentQuestion.question_id}` : undefined}
                          value={option}
                          checked={isSelected}
                          onChange={() => {
                            if (isMultipleAnswer) {
                              handleCheckboxChange(currentQuestion.question_id, option);
                            } else {
                              handleAnswerChange(currentQuestion.question_id, option);
                            }
                          }}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-900 flex-1">
                          <span className="font-medium">{option}.</span> {optionText}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Card>

              {/* Navigation and Submit */}
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={answeredCount !== totalQuestions}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
