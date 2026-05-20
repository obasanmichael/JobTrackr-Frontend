import { describe, expect, it } from 'vitest';
import { jobDetailToCreateApplicationPayload } from './job-mappers';

describe('jobDetailToCreateApplicationPayload', () => {
  it('maps external job detail into a Saved application draft', () => {
    const payload = jobDetailToCreateApplicationPayload({
      id: 'job-1',
      title: 'Backend Engineer',
      companyName: 'Acme',
      location: 'London',
      workMode: 'REMOTE',
      applyUrl: 'https://jobs.example/acme/1',
      salaryMin: 100000,
      salaryMax: 120000,
      currency: 'USD',
      source: 'Demo Greenhouse',
      sourceMeta: { name: 'Demo Greenhouse', type: 'ATS_FEED' },
      postedAt: '2026-05-01T00:00:00.000Z',
      description: 'Build APIs',
      requirements: null,
      experienceLevel: 'SENIOR',
      employmentType: 'FULL_TIME',
      country: 'UK',
    });

    expect(payload.jobTitle).toBe('Backend Engineer');
    expect(payload.company).toBe('Acme');
    expect(payload.status).toBe('Saved');
    expect(payload.workMode).toBe('Remote');
    expect(payload.notes).toContain('Demo Greenhouse');
  });
});
