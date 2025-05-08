export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-sm min-w-[500px]">
        <h1 className="text-2xl font-bold">FIT Distance</h1>
        <p className="text-gray-600 mb-4">Update the distance on a FIT file.</p>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-900">
          Upload FIT file
        </label>
        <div className="mt-2">
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <input
              id="file-upload"
              type="file"
              accept=".fit"
              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
            />
          </div>
        </div>
        <label htmlFor="new-distance" className="block text-sm font-medium text-gray-900 mt-4">
          New Distance (miles)
        </label>
        <div className="mt-2">
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <input
              id="new-distance"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          className="mt-6 cursor-pointer w-full py-2.5 bg-black text-white font-semibold text-sm rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
            Update
        </button>
      </div>
    </div>
  );
}