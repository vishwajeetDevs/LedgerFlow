import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center animate-fade-in-up">
        <h2 className="text-4xl font-bold text-red-500 mb-2">403</h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unauthorized</h3>
        <p className="text-gray-500 mb-6">You do not have permission to access this page.</p>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
