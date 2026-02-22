import { getSettings } from '@/app/actions/settings';
import { Link } from '@/i18n/routing';

const HeroBanner = async () => {
    const settings = await getSettings();

    return (
        <div className="px-4 py-4">
            <div className="relative w-full h-40 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl overflow-hidden shadow-lg flex items-center px-6">
                <div className="z-10 text-white">
                    <h2 className="text-xl font-bold mb-1">{settings.heroBannerTitle}</h2>
                    <p className="text-sm opacity-90 mb-3">{settings.heroBannerSubtitle}</p>
                    <Link href="/consult">
                        <button className="bg-white text-primary-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            진료 예약하기
                        </button>
                    </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
