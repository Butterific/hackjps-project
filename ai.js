// ai.js
// This file exports your Gemini API key and a function for interacting with the Gemini API.

// IMPORTANT: For production applications, it's highly recommended to store API keys
// securely on a server-side environment (e.g., using environment variables)
// and make API calls from your backend, not directly from client-side code.
// This is for demonstration purposes only.
export const GEMINI_API_KEY = "AIzaSyB-qmJFk7kpEKkoDC2O4ad80Yb58yfXK60";

/**
 * Calls the Gemini API to generate content.
 * @param {string} prompt The text prompt for the AI.
 * @param {boolean} [isStructuredResponse=false] Set to true if a structured JSON response is expected.
 * @param {object} [responseSchema=null] Optional. The JSON schema for the structured response.
 * @returns {Promise<string|object>} A promise that resolves to the generated text (string) or parsed JSON object.
 * @throws {Error} If the API call fails or the response structure is unexpected.
 */
export async function callGeminiAPI(prompt, isStructuredResponse = false, responseSchema = null) {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    
    const payload = { contents: chatHistory };

    // Add generationConfig for structured responses if requested
    if (isStructuredResponse && responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            throw new Error(`API call failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();

        // Validate the response structure
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            
            const aiResponsePart = result.candidates[0].content.parts[0].text;

            if (isStructuredResponse) {
                try {
                    return JSON.parse(aiResponsePart);
                } catch (parseError) {
                    console.error("Failed to parse JSON response:", aiResponsePart, parseError);
                    throw new Error("Received non-JSON response when structured JSON was expected.");
                }
            } else {
                return aiResponsePart;
            }
        } else {
            throw new Error("Unexpected API response structure.");
        }
    } catch (error) {
        console.error("Error in callGeminiAPI:", error);
        throw error; // Re-throw to be handled by the caller
    }
}
