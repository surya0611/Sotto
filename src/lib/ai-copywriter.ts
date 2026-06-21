import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function generateProductTemplate(productName: string, tone: 'professional' | 'urgent' | 'playful'): Promise<string> {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Falling back to default template.');
    return '{{name}} in {{city}} recently purchased {{product}}';
  }

  let toneInstruction = '';
  switch (tone) {
    case 'urgent':
      toneInstruction = 'Create a strong sense of FOMO, urgency, and scarcity. Make the buyer feel like they are missing out if they do not act now. Keep it to one short sentence. NO EMOJIS.';
      break;
    case 'playful':
      toneInstruction = 'Use a fun, modern, and playful tone. Use 1 or 2 highly relevant emojis. Keep it to one short sentence.';
      break;
    case 'professional':
    default:
      toneInstruction = 'Keep it highly professional, understated, and luxurious. Focus on quality, validation, and exclusivity. Keep it to one short sentence. NO EMOJIS.';
      break;
  }

  const prompt = `You are an elite e-commerce copywriter. 
A customer just purchased the following product: "${productName}".

Your task is to write a single-sentence "social proof" notification popup template for this exact product to increase conversion rates.
The template MUST include the following exact exact variables (do not change their format):
- {{name}} : The customer's first name
- {{city}} : The customer's city
- {{product}} : The product name

Instructions:
1. ${toneInstruction}
2. The copy MUST be highly contextual to the product. For example, if it's a weighted blanket, mention getting great sleep. If it's a protein powder, mention making gains. 
3. DO NOT output anything other than the exact template string. No quotes, no hashtags, no explanations. Just the raw template string.

Examples of good templates:
- {{name}} in {{city}} is about to get the best sleep of their life thanks to {{product}}
- The last {{product}} was just secured by {{name}} in {{city}}!

Product Name: ${productName}
Generate the template now:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text || '';
    
    // Clean up any potential markdown or quotes
    text = text.replace(/^["']/, '').replace(/["']$/, '').trim();
    
    // Fallback if the AI completely ignored instructions and didn't include the variables
    if (!text.includes('{{name}}') || !text.includes('{{city}}') || !text.includes('{{product}}')) {
      return '{{name}} in {{city}} recently purchased {{product}}';
    }

    return text;
  } catch (error) {
    console.error('Error generating AI template:', error);
    return '{{name}} in {{city}} recently purchased {{product}}';
  }
}
