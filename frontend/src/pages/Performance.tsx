import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, Plus, Star } from 'lucide-react';
import { performanceService, PerformanceReview } from '../services/performance.service';
import { employeeService } from '../services/employee.service';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const createReviewSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  reviewPeriod: z.string().min(1, 'e.g. H1 2026 or Q1 2026'),
  technicalSkill: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  teamwork: z.coerce.number().min(1).max(5),
  problemSolving: z.coerce.number().min(1).max(5),
  comments: z.string().optional(),
});

type CreateReviewFormData = z.infer<typeof createReviewSchema>;

export const Performance: React.FC = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isEmployee = role === 'EMPLOYEE';
  const canReview = ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'SUPER_ADMIN'].includes(role || '');

  const { data, isLoading } = useQuery({
    queryKey: ['performance-reviews', isEmployee],
    queryFn: () => (isEmployee ? performanceService.getMy() : performanceService.getAll()),
  });

  const { data: empData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
    enabled: canReview,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      technicalSkill: 4,
      communication: 4,
      teamwork: 4,
      problemSolving: 4,
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateReviewFormData) => performanceService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const onSubmit = (formData: CreateReviewFormData) => {
    createMutation.mutate(formData);
  };

  const reviews = data?.data || [];
  const empOptions = (empData?.data || []).map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.designation})`,
    value: e.id,
  }));

  if (isLoading) {
    return <LoadingSkeleton rows={4} columns={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Reviews</h1>
          <p className="text-sm text-slate-500">Track skill assessments, leadership metrics, and appraisals</p>
        </div>
        {canReview && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Submit Review
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <Card key={rev.id} className="p-6 border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <Avatar
                  src={rev.employee?.profileImage}
                  firstName={rev.employee?.firstName}
                  lastName={rev.employee?.lastName}
                  employeeCode={rev.employee?.employeeCode}
                  email={rev.employee?.email}
                  size="md"
                />
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {rev.reviewPeriod}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {rev.employee
                      ? `${rev.employee.firstName} ${rev.employee.lastName}`
                      : 'Employee Review'}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {rev.employee?.designation} • Reviewed by {rev.reviewer?.firstName} {rev.reviewer?.lastName}
                  </span>
                </div>
              </div>
              <div className="text-center bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 shrink-0">
                <div className="flex items-center text-amber-500 justify-center">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span className="text-lg font-black text-slate-900">{rev.overallRating}</span>
                </div>
                <span className="text-[10px] text-slate-500">/ 5.0</span>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                <span className="text-slate-600">Technical Skill</span>
                <span className="font-bold text-slate-900">{rev.technicalSkill} / 5</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                <span className="text-slate-600">Communication</span>
                <span className="font-bold text-slate-900">{rev.communication} / 5</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                <span className="text-slate-600">Teamwork</span>
                <span className="font-bold text-slate-900">{rev.teamwork} / 5</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                <span className="text-slate-600">Problem Solving</span>
                <span className="font-bold text-slate-900">{rev.problemSolving} / 5</span>
              </div>
            </div>

            {rev.comments && (
              <div className="mt-4 p-3 bg-slate-50/75 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Manager Feedback
                </span>
                <p className="text-xs text-slate-700 mt-1 italic">"{rev.comments}"</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Submit Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Performance Review"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Employee to Review"
            placeholder="Select employee"
            options={empOptions}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />

          <Input
            label="Review Period"
            placeholder="e.g. Q1 2026 or Annual 2026"
            error={errors.reviewPeriod?.message}
            {...register('reviewPeriod')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              label="Technical Skill (1-5)"
              error={errors.technicalSkill?.message}
              {...register('technicalSkill')}
            />
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              label="Communication (1-5)"
              error={errors.communication?.message}
              {...register('communication')}
            />
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              label="Teamwork (1-5)"
              error={errors.teamwork?.message}
              {...register('teamwork')}
            />
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              label="Problem Solving (1-5)"
              error={errors.problemSolving?.message}
              {...register('problemSolving')}
            />
          </div>

          <Input
            label="Manager Comments & Feedback"
            placeholder="Write constructive appraisal remarks..."
            error={errors.comments?.message}
            {...register('comments')}
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Appraisal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
