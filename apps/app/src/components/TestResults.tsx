import type { TestResult, TestSubmission } from "@app/types/step";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner.tsx";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";

interface TestResultsProps {
  submission: TestSubmission;
  onCalculateResults: (submission: TestSubmission) => Promise<TestSubmission>;
  onResetTest: () => void;
}

export function TestResults({
  submission,
  onCalculateResults,
  onResetTest,
}: TestResultsProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateResults = async () => {
      try {
        setIsCalculating(true);
        setError(null);
        const updatedSubmission = await onCalculateResults(submission);
        setResult(updatedSubmission.result || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to calculate results",
        );
      } finally {
        setIsCalculating(false);
      }
    };

    calculateResults();
  }, [submission, onCalculateResults]);

  if (isCalculating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center space-y-6">
          <LoadingSpinner />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Calculating Your Results
            </h2>
            <p className="text-gray-600 max-w-md">
              We're analyzing your responses to provide personalized insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="text-center space-y-6">
          <div className="text-red-500 text-6xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Something went wrong
            </h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={onResetTest} className="mt-4">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Results Are Ready!
          </h1>
          <p className="text-gray-600 text-lg">
            Based on your responses, here's what we discovered about you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personality Type Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                Your Personality Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-indigo-600">
                  {result.personalityType}
                </div>
                <p className="text-gray-600">
                  This type represents your natural tendencies and preferences.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Test Statistics Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Test Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-semibold">
                    {Math.round(result.totalTime / 1000)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold">
                    {result.selections.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test ID:</span>
                  <span className="font-mono text-sm">{result.testId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.recommendations?.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <span className="text-blue-500 font-bold">
                      {index + 1}.
                    </span>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Selections Card */}
          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Your Selections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {result.selections.map((selection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        Question {selection.stepNumber}:
                      </span>
                      <p className="text-gray-600">
                        {selection.selectedOptionName}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(selection.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <Button
            onClick={() => {
              onResetTest();
              // Force navigation to first step after reset
              setTimeout(() => {
                window.location.href = "/test/1";
              }, 100);
            }}
            variant="outline"
          >
            Take Test Again
          </Button>
          <Button onClick={() => window.print()}>Print Results</Button>
        </div>
      </div>
    </div>
  );
}
