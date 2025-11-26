import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, FileQuestion } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddMCQModal } from './AddMCQModal';
import { EditMCQModal } from './EditMCQModal';
import { adminService } from '@/services/admin.service';

interface MCQ {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answers: string[];
  multiple_answer_flag: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MCQsListProps {
  courseId: string;
  courseName: string;
}

export const MCQsList: React.FC<MCQsListProps> = ({ courseId, courseName }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState<MCQ | null>(null);

  useEffect(() => {
    loadMCQs();
  }, [courseId]);

  const loadMCQs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCourseMCQs(courseId);
      setMcqs(data);
    } catch (error) {
      console.error('Failed to load MCQs:', error);
      alert('Failed to load MCQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await adminService.deleteMCQ(questionId);
      loadMCQs();
    } catch (error: any) {
      console.error('Failed to delete MCQ:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete MCQ';
      alert(errorMessage);
    }
  };

  const getOptionLabel = (optionKey: string): string => {
    return optionKey.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Generate Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Multiple Choice Questions</h2>
          <p className="text-sm text-gray-500 mt-1">
            {mcqs.length} question{mcqs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex space-x-3">
          {/* AI Generate Button */}
          <Button
            variant="secondary"
            disabled={true}
            className="relative overflow-hidden group"
            title="Coming soon: AI-powered question generation"
          >
            <Sparkles size={16} className="mr-2 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
              Generate Questions with AI
            </span>
          </Button>

          {/* Add Question Button */}
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* MCQs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : mcqs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a multiple choice question.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {mcqs.map((mcq, index) => (
            <Card key={mcq.question_id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                      {mcq.multiple_answer_flag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Multiple Answers
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {mcq.question_text}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingMCQ(mcq)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit question"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(mcq.question_id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey) => {
                    const optionValue = mcq[optionKey as keyof MCQ] as string;
                    const optionLetter = optionKey.split('_')[1].toUpperCase();
                    const isCorrect = mcq.correct_answers.includes(optionLetter);

                    return (
                      <div
                        key={optionKey}
                        className={`flex items-start p-3 rounded-lg border-2 ${
                          isCorrect
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0 mr-3">
                          {mcq.multiple_answer_flag ? (
                            <input
                              type="checkbox"
                              checked={isCorrect}
                              readOnly
                              className="h-4 w-4 text-green-600 mt-0.5"
                            />
                          ) : (
                            <input
                              type="radio"
                              checked={isCorrect}
                              readOnly
                              className="h-4 w-4 text-green-600 mt-0.5"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {optionLetter}.
                          </span>
                          <span className="text-sm text-gray-900 ml-2">
                            {optionValue}
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="flex-shrink-0 ml-2 text-xs font-medium text-green-700">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add MCQ Modal */}
      <AddMCQModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        courseId={courseId}
        courseName={courseName}
        onSuccess={loadMCQs}
      />

      {/* Edit MCQ Modal */}
      {editingMCQ && (
        <EditMCQModal
          isOpen={!!editingMCQ}
          onClose={() => setEditingMCQ(null)}
          mcq={editingMCQ}
          courseName={courseName}
          onSuccess={loadMCQs}
        />
      )}
    </div>
  );
};
