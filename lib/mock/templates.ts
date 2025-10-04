export interface TemplateSummary {
  id: number;
  title: string;
  description: string;
  creator: string;
  team: string;
  tags: string[];
  usageCount: number;
  rating: number;
  lastUpdated: string;
  category: string;
}

export const templateSummaries: TemplateSummary[] = [
  {
    id: 1,
    title: "Quarterly Review Template",
    description: "Comprehensive template for quarterly performance reviews and goal setting",
    creator: "Sarah Chen",
    team: "HR Team",
    tags: ["Reports", "Performance", "Management"],
    usageCount: 42,
    rating: 4.8,
    lastUpdated: "2 days ago",
    category: "HR",
  },
  {
    id: 2,
    title: "Client Onboarding Process",
    description: "Step-by-step guide for onboarding new clients with all necessary documentation",
    creator: "Mike Rodriguez",
    team: "Sales Team",
    tags: ["Process", "Communication", "Sales"],
    usageCount: 28,
    rating: 4.6,
    lastUpdated: "1 week ago",
    category: "Sales",
  },
  {
    id: 3,
    title: "Bug Report Analysis",
    description: "Technical analysis template for categorizing and prioritizing bug reports",
    creator: "Alex Kim",
    team: "Engineering",
    tags: ["Technical", "Analysis", "QA"],
    usageCount: 35,
    rating: 4.9,
    lastUpdated: "3 days ago",
    category: "Engineering",
  },
  {
    id: 4,
    title: "Marketing Copy Generator",
    description: "Create compelling marketing copy for various channels and campaigns",
    creator: "Emma Johnson",
    team: "Marketing",
    tags: ["Marketing", "Content", "Copy"],
    usageCount: 19,
    rating: 4.7,
    lastUpdated: "5 days ago",
    category: "Marketing",
  },
  {
    id: 5,
    title: "Meeting Summary Format",
    description: "Standardized format for meeting summaries with action items and follow-ups",
    creator: "David Wilson",
    team: "Operations",
    tags: ["Documentation", "Meetings", "Process"],
    usageCount: 56,
    rating: 4.5,
    lastUpdated: "1 day ago",
    category: "Operations",
  },
  {
    id: 6,
    title: "Customer Feedback Analysis",
    description: "Analyze customer feedback and extract actionable insights",
    creator: "Lisa Park",
    team: "Product Team",
    tags: ["Analysis", "Customer", "Product"],
    usageCount: 31,
    rating: 4.8,
    lastUpdated: "4 days ago",
    category: "Product",
  },
];

export const templateCategories: string[] = [
  "all",
  "HR",
  "Sales",
  "Engineering",
  "Marketing",
  "Operations",
  "Product",
];

export interface TemplateExampleOutput {
  id: number;
  title: string;
  preview: string;
}

export const templateExampleOutputs: TemplateExampleOutput[] = [
  {
    id: 1,
    title: "Software Engineer Review",
    preview:
      "**Employee Information:**\n- Name: Alex Thompson\n- Role: Senior Software Engineer\n- Department: Engineering\n- Review Period: Q3 2024\n\n**Performance Areas:**\n\n1. **Goal Achievement**\n   - Successfully led the migration of legacy authentication system\n   - Delivered 3 major features ahead of schedule...",
  },
  {
    id: 2,
    title: "Marketing Manager Review",
    preview:
      "**Employee Information:**\n- Name: Sarah Martinez\n- Role: Marketing Manager\n- Department: Marketing\n- Review Period: Q3 2024\n\n**Performance Areas:**\n\n1. **Goal Achievement**\n   - Exceeded lead generation targets by 25%\n   - Launched successful product campaign with 40% engagement rate...",
  },
];

export const templateSamplePrompt = `You are an expert in quarterly performance reviews. Create a comprehensive quarterly review for an employee based on the following template:

**Employee Information:**
- Name: [Employee Name]
- Role: [Job Title]
- Department: [Department]
- Review Period: [Quarter and Year]

**Performance Areas to Evaluate:**

1. **Goal Achievement**
   - Review progress on quarterly objectives
   - Assess completion rate and quality of deliverables
   - Note any exceeded expectations or areas of concern

2. **Key Competencies**
   - Technical skills relevant to the role
   - Communication and collaboration
   - Problem-solving and initiative
   - Leadership (if applicable)

3. **Growth and Development**
   - Skills developed during the quarter
   - Training completed or in progress
   - Areas for future development

4. **Feedback Integration**
   - How well the employee incorporated previous feedback
   - Self-awareness and adaptability

**Format Requirements:**
- Use a professional, constructive tone
- Include specific examples where possible
- Provide actionable recommendations
- End with clear goals for the next quarter

Please structure the review with clear headings and bullet points for easy reading.`;
