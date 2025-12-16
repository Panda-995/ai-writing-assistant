import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AISettings } from "../types";

// Define the response schema explicitly to ensure JSON structure (used for Gemini)
const analysisSchemaObj = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        total: { type: Type.NUMBER, description: "Overall score out of 100" },
        readability: { type: Type.NUMBER, description: "Readability score out of 100" },
        logic: { type: Type.NUMBER, description: "Logic and structure score out of 100" },
        emotion: { type: Type.NUMBER, description: "Emotional engagement score out of 100" },
        creativity: { type: Type.NUMBER, description: "Creativity and uniqueness score out of 100" },
      },
      required: ["total", "readability", "logic", "emotion", "creativity"],
    },
    summary: { type: Type.STRING, description: "A concise summary of the article" },
    toneAnalysis: { type: Type.STRING, description: "Description of the current tone (e.g., Professional, Emotional, Urgent)" },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 5-7 SEO keywords or key topics extracted from the text",
    },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "The original text segment containing the issue" },
          suggestion: { type: Type.STRING, description: "The corrected or improved version" },
          reason: { type: Type.STRING, description: "Explanation of why this change is recommended" },
          type: { type: Type.STRING, description: "Type of issue: 'grammar', 'typo', 'style', or 'punctuation'" },
          location_snippet: { type: Type.STRING, description: "A short context snippet (approx 10 chars before/after) to help find the location" },
        },
        required: ["original", "suggestion", "reason", "type", "location_snippet"],
      },
      description: "List of specific improvements, typos, or grammar fixes",
    },
    titleAnalysis: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "Title score out of 100" },
        viralPotential: { type: Type.STRING, description: "High, Medium, or Low" },
        critique: { type: Type.STRING, description: "Brief analysis of the current title" },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Tactical advice to improve the title",
        },
        examples: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-5 Better alternative titles based on the content",
        },
      },
      required: ["score", "viralPotential", "critique", "suggestions", "examples"],
    },
    structure: {
      type: Type.OBJECT,
      description: "The logical structure tree of the article. Root is the main theme, children are main arguments, their children are supporting evidence.",
      properties: {
        name: { type: Type.STRING, description: "Main Topic / Title" },
        type: { type: Type.STRING, enum: ["root"] },
        children: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
               name: { type: Type.STRING, description: "Section header or Main Argument" },
               type: { type: Type.STRING, enum: ["main_point", "sub_point", "evidence", "conclusion"] },
               description: { type: Type.STRING },
               children: {
                 type: Type.ARRAY,
                 items: {
                    type: Type.OBJECT,
                    properties: {
                       name: { type: Type.STRING },
                       type: { type: Type.STRING },
                       description: { type: Type.STRING }
                       // Gemini SDK schema recursion limit is shallow, usually we stop defining deep children here
                       // but the model will infer the recursive structure from the prompt.
                    }
                 }
               }
             },
             required: ["name", "type"]
          }
        }
      },
      required: ["name", "type", "children"]
    },
    polishedContent: { type: Type.STRING, description: "The fully rewritten article incorporating all improvements while maintaining the original voice." },
  },
  required: ["scores", "summary", "keywords", "corrections", "titleAnalysis", "structure", "polishedContent", "toneAnalysis"],
};

// Helper for OpenAI Prompt
const jsonStructureHint = `
Please output a valid JSON object matching this structure exactly:
{
  "scores": { "total": number, "readability": number, "logic": number, "emotion": number, "creativity": number },
  "summary": string,
  "toneAnalysis": string,
  "keywords": string[],
  "corrections": [ { "original": string, "suggestion": string, "reason": string, "type": "grammar"|"typo"|"style"|"punctuation", "location_snippet": string } ],
  "titleAnalysis": { "score": number, "viralPotential": "High"|"Medium"|"Low", "critique": string, "suggestions": string[], "examples": string[] },
  "structure": { "name": string, "type": "root", "children": [ { "name": string, "type": "main_point"|"sub_point"|"evidence"|"conclusion", "description": string, "children": [] } ] },
  "polishedContent": string
}
`;

export const analyzeArticle = async (title: string, content: string, settings?: AISettings): Promise<AnalysisResult> => {
  if (!content.trim()) {
    throw new Error("文章内容不能为空");
  }

  // Fallback to defaults if no settings provided (backward compatibility)
  const provider = settings?.provider || 'gemini';
  const apiKey = settings?.apiKey || process.env.API_KEY || '';
  const model = settings?.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
  const baseUrl = settings?.baseUrl;

  if (!apiKey) {
    throw new Error("API Key 未配置。请点击右上角设置图标进行配置。");
  }

  const promptText = `
    作为一位资深的中文写作主编和新媒体运营专家，请对以下文章进行深度分析和优化。
    
    文章标题: ${title || "未提供标题"}
    文章正文:
    ${content}
    
    请完成以下任务：
    1. 评分：从总分、可读性、逻辑性、情感共鸣、创意度五个维度打分（0-100）。
    2. 摘要：生成一段简短的摘要。
    3. 关键词：提取 SEO 关键词。
    4. 纠错与优化：找出错别字、语病、标点错误以及可以润色的地方。
    5. 标题分析：分析标题吸引力，给出优化建议和替代标题。
    6. 逻辑结构分析：请生成一个树状结构来表示文章的逻辑流。根节点是文章核心主题，第一层子节点是主要论点或章节，第二层是支撑论据或细节。
    7. 润色全文：提供一份修改后的全文版本。
    8. 语气分析：分析当前文章的语调。
    
    ${provider === 'openai' ? jsonStructureHint : '请务必以 JSON 格式返回结果，严查错别字和语法问题。'}
  `;

  try {
    if (provider === 'gemini') {
      // --- Google Gemini Implementation ---
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        // @google/genai supports baseUrl in constructor options for proxy usage
        ...(baseUrl ? { baseUrl } : {}) 
      });

      const response = await ai.models.generateContent({
        model: model,
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchemaObj,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      return JSON.parse(text) as AnalysisResult;

    } else {
      // --- OpenAI / Compatible Implementation ---
      const apiUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/v1/chat/completions` : 'https://api.openai.com/v1/chat/completions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are a helpful writing assistant. You must output only valid JSON." },
            { role: "user", content: promptText }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI request failed: ${response.status}`);
      }

      const data = await response.json();
      const contentStr = data.choices?.[0]?.message?.content;
      if (!contentStr) throw new Error("Empty response from OpenAI");

      return JSON.parse(contentStr) as AnalysisResult;
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
