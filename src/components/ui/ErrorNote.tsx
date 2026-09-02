export default function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="my-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{message}</p>
  )
}
