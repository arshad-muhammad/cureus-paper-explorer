
import { Mail } from 'lucide-react';

interface EnhancementStatusProps {
  isEnhanced: boolean;
}

const EnhancementStatus = ({ isEnhanced }: EnhancementStatusProps) => {
  if (!isEnhanced) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 text-blue-800">
        <Mail className="h-5 w-5" />
        <span className="font-medium">Email Enhancement Active</span>
      </div>
      <p className="text-blue-700 text-sm mt-1">
        Authors have been enhanced with additional email data from our database and scraping services.
      </p>
    </div>
  );
};

export default EnhancementStatus;
