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
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
            <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
          </div>
          <p className="text-apple-gray-4 text-body">Loading capstone details...</p>
        </div>
      </div>
    );
  }

  if (!capstone) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Award className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">Capstone not found</h3>
            <p className="text-body text-apple-gray-4 mb-6">The capstone project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/capstones')}>
              Back to Capstones
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/capstones')}
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Capstones
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-display-2 font-semibold text-apple-gray-6 mb-3">
              {capstone.capstone_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-apple-gray-1 text-apple-gray-5">
                <Clock className="w-4 h-4" />
                <span className="text-body font-medium">{capstone.duration_weeks} weeks</span>
              </div>

              {capstone.dataset_link && (
                <a
                  href={capstone.dataset_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-apple-blue hover:bg-blue-100 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-body font-medium">Dataset</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Tags */}
            {capstone.tags && capstone.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                {capstone.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-caption font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <Card variant="elevated" className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-title-2 font-semibold text-apple-gray-6">About This Capstone</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-body text-apple-gray-5 whitespace-pre-line leading-relaxed">
            {capstone.guidelines.description}
          </p>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card variant="elevated" className="mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-title-2 font-semibold text-apple-gray-6">Learning Objectives</h2>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {capstone.guidelines.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-body text-apple-gray-6">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weekly Plan */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-title-1 font-semibold text-apple-gray-6">Weekly Plan</h2>
        </div>
        
        <div className="space-y-6">
          {capstone.guidelines.weekly_plan.map((week, index) => (
            <Card 
              key={index} 
              variant="elevated" 
              className="overflow-hidden"
              style={{ animationDelay: `${0.25 + index * 0.05}s` }}
            >
              {/* Week header bar */}
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-violet-600"></div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-body">
                    W{week.week}
                  </span>
                  <h3 className="text-title-2 font-semibold text-apple-gray-6">
                    {week.title}
                  </h3>
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-body font-semibold text-apple-gray-5 mb-3">
                    <BookOpen className="w-4 h-4" />
                    Topics Covered
                  </h4>
                  <ul className="space-y-1.5 ml-6">
                    {week.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-start gap-2 text-body text-apple-gray-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tasks */}
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-body font-semibold text-apple-gray-5 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    Tasks
                  </h4>
                  <ul className="space-y-1.5 ml-6">
                    {week.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start gap-2 text-body text-apple-gray-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="flex items-center gap-2 text-body font-semibold text-apple-gray-5 mb-3">
                    <Target className="w-4 h-4" />
                    Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {week.deliverables.map((deliverable, deliverableIndex) => (
                      <li key={deliverableIndex} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 mt-2 flex-shrink-0"></span>
                        <span className="text-body text-apple-gray-6">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Deliverable */}
      <Card variant="elevated" className="mb-6 overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-600"></div>
        <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Final Deliverable</h2>
            </div>
          </CardHeader>
          <div className="pl-13">
            <h3 className="text-title-3 font-semibold text-apple-gray-6 mb-2">
              {capstone.guidelines.final_deliverable.title}
            </h3>
            <p className="text-body text-apple-gray-5 mb-4">
              {capstone.guidelines.final_deliverable.description}
            </p>

            <h4 className="text-body font-semibold text-apple-gray-5 mb-3">Requirements:</h4>
            <ul className="space-y-2">
              {capstone.guidelines.final_deliverable.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-body text-apple-gray-6">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-title-2 font-semibold text-apple-gray-6">Resources</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {capstone.guidelines.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-xl bg-apple-gray-1 hover:bg-blue-50 group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow">
                  <ExternalLink className="w-5 h-5 text-apple-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium text-apple-gray-6 group-hover:text-apple-blue transition-colors">
                    {resource.title}
                  </div>
                  <div className="text-caption text-apple-gray-4 capitalize">{resource.type}</div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
