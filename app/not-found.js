import { Construction } from 'lucide-react'; // Using lucide-react icons

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="text-center">
        <Construction className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Page Under Construction</h2>
        <p className="text-lg text-gray-600 mb-6">
          Sorry! The page  is currently under development.
        </p>
        <div className="text-lg text-yellow-600 animate-bounce">
          Stay tuned! 🚧
        </div>
      </div>
    </div>
  );
}
