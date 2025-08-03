import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:3001/api';
const MOCK_USER_ID = 'test-user-123';

// Mock user responses for all 10 questions
const mockResponses = [
  { stepNumber: 1, selectedOption: 0 }, // Warm, breezy night air
  { stepNumber: 2, selectedOption: 1 }, // Ocean Blue door
  { stepNumber: 3, selectedOption: 2 }, // Wind moving through trees
  { stepNumber: 4, selectedOption: 0 }, // First option for step 4
  { stepNumber: 5, selectedOption: 1 }, // Second option for step 5
  { stepNumber: 6, selectedOption: 2 }, // Third option for step 6
  { stepNumber: 7, selectedOption: 3 }, // Fourth option for step 7
  { stepNumber: 8, selectedOption: 0 }, // First option for step 8
  { stepNumber: 9, selectedOption: 1 }, // Second option for step 9
  { stepNumber: 10, selectedOption: 2 }, // Third option for step 10
];

async function testQuizFlow() {
  console.log('🚀 Starting quiz test with mock user...\n');
  
  const results = {
    userId: MOCK_USER_ID,
    responses: [],
    finalOutput: null,
    error: null
  };

  try {
    // Submit each response
    for (let i = 0; i < mockResponses.length; i++) {
      const response = mockResponses[i];
      console.log(`📝 Submitting response ${i + 1}/10: Step ${response.stepNumber}, Option ${response.selectedOption}`);
      
      const quizResponse = await fetch(`${API_BASE_URL}/quiz/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          stepNumber: response.stepNumber,
          selectedOption: response.selectedOption
        })
      });

      const responseData = await quizResponse.json();
      results.responses.push({
        step: response.stepNumber,
        option: response.selectedOption,
        response: responseData
      });

      console.log(`   Response: ${JSON.stringify(responseData, null, 2)}\n`);

      // If quiz is complete, break
      if (responseData.isComplete) {
        results.finalOutput = responseData;
        break;
      }
    }

    // Get user status
    console.log('📊 Getting user status...');
    const statusResponse = await fetch(`${API_BASE_URL}/user/${MOCK_USER_ID}/status`);
    const statusData = await statusResponse.json();
    results.status = statusData;
    console.log(`   Status: ${JSON.stringify(statusData, null, 2)}\n`);

    // Get user preferences
    console.log('🎯 Getting user preferences...');
    const preferencesResponse = await fetch(`${API_BASE_URL}/user/${MOCK_USER_ID}/preferences`);
    const preferencesData = await preferencesResponse.json();
    results.preferences = preferencesData;
    console.log(`   Preferences: ${JSON.stringify(preferencesData, null, 2)}\n`);

    // Get recommendations
    console.log('🌟 Getting travel recommendations...');
    const recommendationsResponse = await fetch(`${API_BASE_URL}/user/${MOCK_USER_ID}/recommendations`);
    const recommendationsData = await recommendationsResponse.json();
    results.recommendations = recommendationsData;
    console.log(`   Recommendations: ${JSON.stringify(recommendationsData, null, 2)}\n`);

  } catch (error) {
    console.error('❌ Error during test:', error);
    results.error = error.message;
  }

  // Save results to file
  const outputPath = './quiz-test-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`✅ Test completed! Results saved to: ${outputPath}`);
  console.log('\n📋 Final Results Summary:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Run the test
testQuizFlow().catch(console.error); 