
import { Globe } from 'lucide-react';

interface DOISectionProps {
  doi: string;
}

const DOISection = ({ doi }: DOISectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Globe className="h-5 w-5 mr-2 text-blue-600" />
        Digital Object Identifier (DOI)
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg border">
        <code className="text-sm font-mono text-gray-800">{doi}</code>
      </div>
    </div>
  );
};

export default DOISection;
