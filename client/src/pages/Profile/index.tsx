// client/src/pages/Profile/index.tsx
export function Profile() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Preferences</h2>
          {/* Preferences form will go here */}
          <p>Update your movie preferences and account settings.</p>
        </div>
      </div>
    </div>
  );
}