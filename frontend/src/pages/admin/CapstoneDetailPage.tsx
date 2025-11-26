import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Clock,
  Tag,
  Target,
  CheckCircle,
  BookOpen,
  ExternalLink,
  Database,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/admin.service';
import { CapstoneDetail } from '@/types';

export const CapstoneDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { capstoneId } = useParams<{ capstoneId: string }>();
  const [capstone, setCapstone] = useState<CapstoneDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (capstoneId) {
      loadCapstoneDetail();
    }
  }, [capstoneId]);

  const loadCapstoneDetail = async () => {
    try {
      const data = await adminService.getCapstoneDetail(capstoneId!);
      setCapstone(data);
    } catch (error) {
      console.error('Failed to load capstone details:', error);
      alert('Failed to load capstone details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!capstone) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Capstone not found</h3>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/capstones')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Capstones
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start">
          <div className="p-4 bg-orange-100 rounded-lg">
            <Award className="h-10 w-10 text-orange-600" />
          </div>
          <div className="ml-4 flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {capstone.capstone_name}
            </h1>

            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-medium">{capstone.duration_weeks} weeks</span>
              </div>

              {capstone.dataset_link && (
                <a
                  href={capstone.dataset_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Database className="h-5 w-5 mr-2" />
                  <span className="font-medium">Dataset</span>
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              )}
            </div>

            {/* Tags */}
            {capstone.tags && capstone.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                {capstone.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Capstone</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {capstone.guidelines.description}
        </p>
      </Card>

      {/* Learning Objectives */}
      <Card className="mb-8">
        <div className="flex items-center mb-4">
          <Target className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
        </div>
        <ul className="space-y-3">
          {capstone.guidelines.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Weekly Plan */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly Plan</h2>
        <div className="space-y-6">
          {capstone.guidelines.weekly_plan.map((week, index) => (
            <Card key={index} className="border-l-4 border-primary-500">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                    Week {week.week}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {week.title}
                  </h3>
                </div>
              </div>

              {/* Topics */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Topics Covered
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                  {week.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>{topic}</li>
                  ))}
                </ul>
              </div>

              {/* Tasks */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tasks
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                  {week.tasks.map((task, taskIndex) => (
                    <li key={taskIndex}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Deliverables
                </h4>
                <ul className="space-y-2">
                  {week.deliverables.map((deliverable, deliverableIndex) => (
                    <li key={deliverableIndex} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Deliverable */}
      <Card className="mb-8 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
        <div className="flex items-center mb-4">
          <Award className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Final Deliverable</h2>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {capstone.guidelines.final_deliverable.title}
        </h3>
        <p className="text-gray-700 mb-4">
          {capstone.guidelines.final_deliverable.description}
        </p>

        <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
        <ul className="space-y-2">
          {capstone.guidelines.final_deliverable.requirements.map((req, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{req}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Resources */}
      <Card>
        <div className="flex items-center mb-4">
          <BookOpen className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
        </div>
        <div className="space-y-3">
          {capstone.guidelines.resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{resource.title}</div>
                <div className="text-sm text-gray-500 capitalize">{resource.type}</div>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};
