import * as ai from "../services/ai.service.js";

/* -------------------------------------------------------------------------- */
/* GENERATE AI RESULT */
/* -------------------------------------------------------------------------- */

export const getResult = async (req, res) => {

  try {

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const result = await ai.generateResult(prompt);

    res.status(200).json({
      result
    });

  } catch (error) {

    console.error("AI Controller Error:", error.message);

    res.status(500).json({
      error: "AI generation failed"
    });

  }

};