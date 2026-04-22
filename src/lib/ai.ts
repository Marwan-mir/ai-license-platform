import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface BusinessCaseData {
  purpose: string
  department?: string
  savingsType: 'TIME_EFFICIENCY' | 'QUALITY_ENHANCEMENT'
  expectedBenefit?: string
  timeEfficiency?: number // Hours saved per month
  qualityImpact?: string
}

export async function parseBusinessCase(freeText: string): Promise<BusinessCaseData> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert business analyst. Parse the following business case text and extract structured information. Return a JSON object with these fields:
          - purpose: Brief description of the project purpose
          - department: One of SME, LAKA, ONBOARDING, SPECIALSERVICE, WFM, CX (if mentioned)
          - savingsType: Either "TIME_EFFICIENCY" or "QUALITY_ENHANCEMENT" 
          - expectedBenefit: Summary of expected benefits
          - timeEfficiency: Number of hours saved per month (if TIME_EFFICIENCY)
          - qualityImpact: Description of quality improvements (if QUALITY_ENHANCEMENT)
          
          Focus on identifying concrete time savings or quality improvements.`
        },
        {
          role: "user",
          content: freeText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    return JSON.parse(result) as BusinessCaseData
  } catch (error) {
    console.error('Error parsing business case:', error)
    throw new Error('Failed to parse business case')
  }
}

export async function generateBusinessCaseQuestions(): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Generate 5-7 guided questions to help users create a comprehensive business case for AI projects. 
          Focus on purpose, benefits, time savings, quality improvements, and department impact.
          Return as a JSON array of question strings.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(result)
    return parsed.questions || []
  } catch (error) {
    console.error('Error generating questions:', error)
    return [
      "What is the main purpose of this AI project?",
      "Which department will benefit most from this project?",
      "How many hours per week do you expect to save?",
      "What specific tasks will be automated or improved?",
      "What quality improvements do you expect to see?"
    ]
  }
}

export async function processGuidedAnswers(answers: Record<string, string>): Promise<BusinessCaseData> {
  try {
    const answersText = Object.entries(answers)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
      .join('\n\n')

    return await parseBusinessCase(answersText)
  } catch (error) {
    console.error('Error processing guided answers:', error)
    throw new Error('Failed to process guided answers')
  }
}