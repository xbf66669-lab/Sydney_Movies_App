// client/src/pages/Recommendations/index.tsx
export function Recommendations() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Recommended For You</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Recommended movies will be displayed here */}
        <p>Your personalized recommendations will appear here as you use the app.</p>
      </div>
    </div>
  );
}