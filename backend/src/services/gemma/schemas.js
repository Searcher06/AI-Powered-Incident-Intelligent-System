import { z } from 'zod';

export const ReportUnderstandingSchema = z.object({
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  tags: z.array(z.string()).optional(),
  affectedInfrastructure: z.array(z.string()).optional(),
  affectedServices: z.array(z.string()).optional(),
  recommendedResponse: z.string().optional(),
});

export const FusionDecisionSchema = z.object({
  decisionType: z.enum(['merge_with_existing', 'create_new_incident', 'no_change']),
  selectedCandidateIndex: z.number().int(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  evidence: z.array(z.string()).optional(),
});

export const BriefingSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  basedOnReportIds: z.array(z.string()).optional(),
});
