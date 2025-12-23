import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileQuestion, FileText, Code, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MCQsList } from '@/components/admin/MCQsList';

type TabType = 'mcqs' | 'short-answers' | 'hands-on';

export const CourseQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const courseName = location.state?.courseName || 'Course';
  const [activeTab, setActiveTab] = useState<TabType>('mcqs');

  const tabs = [
    {
      id: 'mcqs' as TabType,
      label: 'MCQs',
      icon: FileQuestion,
      enabled: true,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'short-answers' as TabType,
      label: 'Short Answers',
      icon: FileText,
      enabled: false,
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      id: 'hands-on' as TabType,
      label: 'Hands On',
      icon: Code,
      enabled: false,
      gradient: 'from-emerald-500 to-green-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/questions')}
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Courses
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-display-2 font-semibold text-apple-gray-6">{courseName}</h1>
            <p className="text-body text-apple-gray-4">
              Manage questions for this course
            </p>
          </div>
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-wrap gap-3 p-2 bg-apple-gray-1 rounded-2xl border border-apple-gray-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isEnabled = tab.enabled;

            return (
              <button
                key={tab.id}
                onClick={() => isEnabled && setActiveTab(tab.id)}
                disabled={!isEnabled}
                className={`
                  relative flex items-center px-5 py-3 rounded-xl font-medium text-body transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-apple-gray-6 shadow-apple'
                      : isEnabled
                      ? 'text-apple-gray-4 hover:text-apple-gray-6 hover:bg-white/50'
                      : 'text-apple-gray-3 cursor-not-allowed'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200
                  ${isActive ? `bg-gradient-to-br ${tab.gradient}` : 'bg-apple-gray-2'}
                `}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isEnabled ? 'text-apple-gray-4' : 'text-apple-gray-3'}`} />
                </div>
                <span>{tab.label}</span>
                {!isEnabled && (
                  <span className="ml-2 flex items-center gap-1 text-mini px-2 py-0.5 rounded-full bg-apple-gray-2 text-apple-gray-4">
                    <Clock className="w-3 h-3" />
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {activeTab === 'mcqs' && courseId && (
          <MCQsList courseId={courseId} courseName={courseName} />
        )}

        {activeTab === 'short-answers' && (
          <Card variant="elevated">
            <CardContent className="p-0">
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">Short Answers</h3>
                <p className="text-body text-apple-gray-4 max-w-md mx-auto">
                  Create open-ended questions that allow employees to provide detailed written responses.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-caption font-medium">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'hands-on' && (
          <Card variant="elevated">
            <CardContent className="p-0">
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center">
                  <Code className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">Hands On Exercises</h3>
                <p className="text-body text-apple-gray-4 max-w-md mx-auto">
                  Build interactive coding challenges and practical exercises for skill development.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-caption font-medium">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
