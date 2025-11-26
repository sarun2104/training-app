import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileQuestion, FileText, Code } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
    },
    {
      id: 'short-answers' as TabType,
      label: 'Short Answers',
      icon: FileText,
      enabled: false,
    },
    {
      id: 'hands-on' as TabType,
      label: 'Hands On',
      icon: Code,
      enabled: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/questions')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Courses
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{courseName}</h1>
        <p className="text-gray-600 mt-2">
          Manage questions for this course
        </p>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
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
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : isEnabled
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      isActive
                        ? 'text-primary-500'
                        : isEnabled
                        ? 'text-gray-400'
                        : 'text-gray-300'
                    }`}
                  />
                  {tab.label}
                  {!isEnabled && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'mcqs' && courseId && (
          <MCQsList courseId={courseId} courseName={courseName} />
        )}

        {activeTab === 'short-answers' && (
          <Card>
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Short Answers</h3>
              <p className="mt-2 text-sm text-gray-500">
                This feature is coming soon
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'hands-on' && (
          <Card>
            <div className="p-12 text-center">
              <Code className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Hands On</h3>
              <p className="mt-2 text-sm text-gray-500">
                This feature is coming soon
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
