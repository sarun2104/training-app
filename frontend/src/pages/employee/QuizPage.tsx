import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  RotateCcw,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
    loadQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
            <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
          </div>
          <p className="text-apple-gray-4 text-body">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full animate-scale-in">
          <Card variant="elevated" className="text-center overflow-hidden">
            {/* Decorative Header */}
            <div className={`h-2 ${result.passed ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}></div>
            
            <CardContent className="py-8 px-6">
              {/* Result Icon */}
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                result.passed 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              } shadow-lg`}>
                {result.passed ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>

              {/* Result Text */}
              <h2 className="text-display-2 font-semibold text-apple-gray-6 mb-2">
                {result.passed ? 'Congratulations!' : 'Keep Learning'}
              </h2>

              <p className="text-body text-apple-gray-4 mb-6">
                {result.passed
                  ? 'You have successfully completed this assessment!'
                  : 'You need at least 50% to pass. Review the material and try again.'}
              </p>

              {/* Score Display */}
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-6 ${
                  result.passed ? 'border-emerald-200' : 'border-red-200'
                }`}>
                  <div className="text-center">
                    <span className={`text-headline font-bold ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.score}%
                    </span>
                    <span className="block text-mini text-apple-gray-4">Score</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-apple-gray-1">
                  <p className="text-mini text-apple-gray-4 mb-0.5">Correct Answers</p>
                  <p className="text-body font-semibold text-apple-gray-6">
                    {result.correct_answers || 0} / {result.total_questions || questions.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-apple-gray-1">
                  <p className="text-mini text-apple-gray-4 mb-0.5">Attempt</p>
                  <p className="text-body font-semibold text-apple-gray-6">
                    #{result.attempt_number || 1}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/employee/courses/${courseId}`)}
                  className="justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Button>
                {!result.passed && (
                  <Button onClick={handleRetry} className="justify-center">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

  // No Questions State
  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No Questions Available</h3>
          <p className="text-body text-apple-gray-4 mb-6">There are no quiz questions for this course yet.</p>
          <Button variant="outline" onClick={() => navigate(`/employee/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-apple-gray-1 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-apple-gray-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FileQuestion className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-title-2 font-semibold text-apple-gray-6">Course Assessment</h1>
                <p className="text-caption text-apple-gray-4">{totalQuestions} questions</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-apple-gray-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-body font-medium text-apple-gray-6">
                  {answeredCount} of {totalQuestions}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-32 h-2 rounded-full bg-apple-gray-2 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-apple-gray-4" />
                    <h3 className="text-body font-semibold text-apple-gray-6">Questions</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = !!answers[q.question_id];
                      const isCurrent = currentQuestionIndex === index;
                      
                      return (
                        <button
                          key={q.question_id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`relative w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 ${
                            isCurrent
                              ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/30 scale-110'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-apple-gray-1 text-apple-gray-4 hover:bg-apple-gray-2'
                          }`}
                        >
                          {index + 1}
                          {isAnswered && !isCurrent && (
                            <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-emerald-500 bg-white rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-6 border-t border-apple-gray-2 space-y-2">
                    <div className="flex items-center gap-2 text-caption">
                      <div className="w-4 h-4 rounded bg-emerald-100"></div>
                      <span className="text-apple-gray-4">Answered</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      <div className="w-4 h-4 rounded bg-apple-gray-1"></div>
                      <span className="text-apple-gray-4">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      <div className="w-4 h-4 rounded bg-apple-blue"></div>
                      <span className="text-apple-gray-4">Current</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Question Display */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Question Navigator */}
            <div className="lg:hidden overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {questions.map((q, index) => {
                  const isAnswered = !!answers[q.question_id];
                  const isCurrent = currentQuestionIndex === index;
                  
                  return (
                    <button
                      key={q.question_id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative w-10 h-10 rounded-xl font-medium text-sm flex-shrink-0 transition-all duration-200 ${
                        isCurrent
                          ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/30'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-apple-gray-4 border border-apple-gray-2'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <Card variant="elevated" className="animate-fade-in">
              <CardContent className="p-4 lg:p-6">
                {/* Question Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-apple-blue/10 text-apple-blue text-caption font-medium">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    {currentQuestion.multiple_answer_flag && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-caption font-medium">
                        Multiple Select
                      </span>
                    )}
                  </div>
                  <h2 className="text-title-1 font-semibold text-apple-gray-6 leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                </div>

                {/* Options */}
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
                        className={`group flex items-start p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-apple-blue/10 to-indigo-50 border-2 border-apple-blue shadow-sm'
                            : 'bg-apple-gray-1 border-2 border-transparent hover:bg-apple-gray-2 hover:border-apple-gray-3'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                          isSelected 
                            ? 'border-apple-blue bg-apple-blue' 
                            : 'border-apple-gray-3 group-hover:border-apple-gray-4'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
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
                          className="sr-only"
                        />
                        <span className={`ml-3 flex-1 transition-colors ${
                          isSelected ? 'text-apple-gray-6' : 'text-apple-gray-5'
                        }`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md mr-2 text-mini font-semibold ${
                            isSelected 
                              ? 'bg-apple-blue text-white' 
                              : 'bg-white text-apple-gray-4 border border-apple-gray-2'
                          }`}>
                            {option}
                          </span>
                          <span className="text-body">{optionText}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Previous
              </Button>

              <div className="flex gap-3">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={answeredCount !== totalQuestions}
                    className={`${
                      answeredCount === totalQuestions
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                        : ''
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="group">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
