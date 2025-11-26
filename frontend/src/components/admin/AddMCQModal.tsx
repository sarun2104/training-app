import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';

interface AddMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onSuccess: () => void;
}

export const AddMCQModal: React.FC<AddMCQModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answers: [] as string[],
    multiple_answer_flag: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question_text.trim()) {
      alert('Please enter a question');
      return;
    }

    if (!formData.option_a.trim() || !formData.option_b.trim() ||
        !formData.option_c.trim() || !formData.option_d.trim()) {
      alert('Please fill in all options');
      return;
    }

    if (formData.correct_answers.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    if (formData.multiple_answer_flag && formData.correct_answers.length === 1) {
      alert('Multiple answer question must have more than one correct answer');
      return;
    }

    if (!formData.multiple_answer_flag && formData.correct_answers.length > 1) {
      alert('Single answer question can only have one correct answer');
      return;
    }

    setSaving(true);
    try {
      await adminService.addMCQ(courseId, formData);
      // Reset form
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answers: [],
        multiple_answer_flag: false,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to add MCQ:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add MCQ';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCorrectAnswerChange = (option: string) => {
    if (formData.multiple_answer_flag) {
      // Multiple answers - toggle checkbox
      if (formData.correct_answers.includes(option)) {
        setFormData({
          ...formData,
          correct_answers: formData.correct_answers.filter((a) => a !== option),
        });
      } else {
        setFormData({
          ...formData,
          correct_answers: [...formData.correct_answers, option],
        });
      }
    } else {
      // Single answer - replace with radio selection
      setFormData({
        ...formData,
        correct_answers: [option],
      });
    }
  };

  const handleMultipleAnswerToggle = (checked: boolean) => {
    setFormData({
      ...formData,
      multiple_answer_flag: checked,
      // Reset correct answers when switching modes
      correct_answers: [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Question to "${courseName}"`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Enter your question here..."
            required
            disabled={saving}
          />
        </div>

        {/* Multiple Answer Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="multiple_answer"
            checked={formData.multiple_answer_flag}
            onChange={(e) => handleMultipleAnswerToggle(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            disabled={saving}
          />
          <label htmlFor="multiple_answer" className="ml-2 block text-sm text-gray-900">
            This question has multiple correct answers
          </label>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options <span className="text-red-500">*</span>
          </label>

          {['A', 'B', 'C', 'D'].map((option) => {
            const optionKey = `option_${option.toLowerCase()}` as keyof typeof formData;
            const isCorrect = formData.correct_answers.includes(option);

            return (
              <div key={option} className="flex items-start space-x-3">
                <div className="flex items-center h-10">
                  {formData.multiple_answer_flag ? (
                    <input
                      type="checkbox"
                      checked={isCorrect}
                      onChange={() => handleCorrectAnswerChange(option)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      disabled={saving}
                    />
                  ) : (
                    <input
                      type="radio"
                      checked={isCorrect}
                      onChange={() => handleCorrectAnswerChange(option)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      disabled={saving}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 text-sm font-medium text-gray-700">
                      {option}.
                    </span>
                    <input
                      type="text"
                      value={formData[optionKey] as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [optionKey]: e.target.value })
                      }
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        isCorrect
                          ? 'border-green-300 bg-green-50 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder={`Option ${option}`}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {formData.multiple_answer_flag
              ? 'Select all correct answers using the checkboxes'
              : 'Select the single correct answer using the radio button'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Adding...' : 'Add Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
