export interface LearningStep {
  id: number
  title: string
  content: string
}

export const steps: LearningStep[] = [
  { id: 1, title: 'Introduction', content: 'Overview of the process and goals. Start here to get a map of what you will learn.' },
  { id: 2, title: 'Eligibility', content: 'Learn about eligibility criteria, points, and common pitfalls.' },
  { id: 3, title: 'Documents', content: 'What documents you need and how to prepare them.' },
  { id: 4, title: 'Application Process', content: 'Step-by-step application flow, timelines and tips.' },
  { id: 5, title: 'Final Review', content: 'Final checklist and next steps to reach full confidence ("full knowledge").' }
]
