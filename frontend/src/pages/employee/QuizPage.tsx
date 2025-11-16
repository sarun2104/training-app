import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import { Question, QuizAnswer } from '@/types';

export const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      loadQuiz();
    }
  }, [courseId]);

  const loadQuiz = async () => {
    try {
      const data = await employeeService.getQuizQuestions(parseInt(courseId!));
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        question_id: parseInt(questionId),
        selected_option: selectedOption as 'A' | 'B' | 'C' | 'D',
      })
    );

    if (quizAnswers.length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const quizResult = await employeeService.submitQuiz(parseInt(courseId!), {
        answers: quizAnswers,
      });
      setResult(quizResult);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz');
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
                : ' - You need at least 70% to pass.'}
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
              <Button onClick={() => navigate(`/employee/courses/${courseId}`)}>
                Back to Course
              </Button>
              {!result.passed && (
                <Button variant="secondary" onClick={handleRetry}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/employee/courses/${courseId}`)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Course
        </button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="flex items-center">
            <FileQuestion className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Quiz</h1>
              <p className="text-gray-600">Answer all questions and submit</p>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No questions available for this course.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.question_id} className="border-b border-gray-200 pb-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  {index + 1}. {question.question_text}
                </h3>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = question[`option_${option.toLowerCase()}` as keyof Question];
                    return (
                      <label
                        key={option}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={option}
                          checked={answers[question.question_id] === option}
                          onChange={() => handleAnswerChange(question.question_id, option)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-900">
                          {option}. {optionText}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => navigate(`/employee/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={Object.keys(answers).length !== questions.length}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
