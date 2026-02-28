export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-4">
            {/* Simple skeleton matching profile layout */}
            <div className="flex flex-col items-center pt-8 pb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-3" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                {[1, 2].map(i => (
                    <div key={i} className="flex gap-3 mb-4 last:mb-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
