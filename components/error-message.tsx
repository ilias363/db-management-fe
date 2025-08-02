export default function ErrorMessage({ error }: { error?: string | string[] }) {
  if (!error) return null;
  if (Array.isArray(error)) {
    return (
      <div className="text-red-500 text-sm">
        {error.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    );
  }
  return <div className="text-red-500 text-sm">{error}</div>;
}
