export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8 relative flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your adventure...</p>
      </div>
    </div>
  );
}
