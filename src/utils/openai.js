const fs = require('fs');
const path = require('path');
const OpenAI = require('openai')
const investorsData = require("../../InvestorsData.json")

const client = new OpenAI({
    apiKey: process.env.MYSECRET, 
});


exports.getChatCompletion = async (prompt) => {
  let data = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
  });
  return data.choices[0].message.content;
};