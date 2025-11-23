import {GoogleGenAI} from '@google/genai'

const ai = new GoogleGenAI({})

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hello there',
    config: {
      systemInstruction: `
      [INSTRUCTION]::
      You will be given a block of raw text.
      This text contains keys and values, but:
      They are not ordered.
      Every key and value appears on its own line.
      Keys and values may be separated by other unrelated lines, or follow loose patterns.
      Some lines may be noise or random text.
      Your task is to:
      Identify all valid keys.
      Identify all valid values.
      Match each key to its correct value as accurately as possible based on wording, context, semantic closeness, domain knowledge, and any patterns present in the dataset.
      Ignore unrelated or noise lines.
      Output the final result as a clean key/value map, for example as JSON.
      If multiple values seem to fit a key, choose the one with the highest semantic confidence and provide the match.
      If no value can reasonably be matched to a key, return "N/A" for that key.
      `,
    },
  })
  console.log(response.text)
}

await main()
