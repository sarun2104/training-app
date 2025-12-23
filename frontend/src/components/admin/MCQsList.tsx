import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, FileQuestion, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Generate Button */}
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Multiple Choice Questions</h2>
              <p className="text-body text-apple-gray-4 mt-1">
                {mcqs.length} question{mcqs.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* AI Generate Button */}
              <Button
                variant="outline"
                disabled={true}
                className="relative overflow-hidden group border-purple-200 hover:border-purple-300"
                title="Coming soon: AI-powered question generation"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-semibold">
                  Generate with AI
                </span>
              </Button>

              {/* Add Question Button */}
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MCQs List */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
              <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
            </div>
            <p className="text-apple-gray-4 text-body">Loading questions...</p>
          </div>
        </div>
      ) : mcqs.length === 0 ? (
        <Card variant="elevated">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No questions yet</h3>
            <p className="text-body text-apple-gray-4 mb-6 max-w-md mx-auto">
              Get started by adding your first multiple choice question to this course.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {mcqs.map((mcq, index) => (
            <Card 
              key={mcq.question_id} 
              variant="elevated"
              className="animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Question Number Strip */}
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-caption font-bold">
                        {index + 1}
                      </span>
                      {mcq.multiple_answer_flag && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium bg-purple-100 text-purple-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Multiple Answers
                        </span>
                      )}
                    </div>
                    <h3 className="text-title-3 font-medium text-apple-gray-6 leading-relaxed">
                      {mcq.question_text}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => setEditingMCQ(mcq)}
                      className="p-2.5 rounded-xl text-apple-gray-4 hover:text-apple-blue hover:bg-blue-50 transition-colors"
                      title="Edit question"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mcq.question_id)}
                      className="p-2.5 rounded-xl text-apple-gray-4 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey) => {
                    const optionValue = mcq[optionKey as keyof MCQ] as string;
                    const optionLetter = optionKey.split('_')[1].toUpperCase();
                    const isCorrect = mcq.correct_answers.includes(optionLetter);

                    return (
                      <div
                        key={optionKey}
                        className={`flex items-start p-4 rounded-xl border-2 transition-all duration-200 ${
                          isCorrect
                            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50'
                            : 'border-apple-gray-2 bg-apple-gray-1 hover:border-apple-gray-3'
                        }`}
                      >
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          {mcq.multiple_answer_flag ? (
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                              isCorrect 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'border-apple-gray-3'
                            }`}>
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isCorrect 
                                ? 'border-emerald-500' 
                                : 'border-apple-gray-3'
                            }`}>
                              {isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-caption font-bold ${isCorrect ? 'text-emerald-700' : 'text-apple-gray-5'}`}>
                            {optionLetter}.
                          </span>
                          <span className={`text-body ml-2 ${isCorrect ? 'text-emerald-800' : 'text-apple-gray-6'}`}>
                            {optionValue}
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="flex-shrink-0 ml-2 flex items-center gap-1 text-mini font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
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
