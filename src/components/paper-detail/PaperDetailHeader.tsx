
import { ExternalLink, Calendar, Users, Mail, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaperDetailHeaderProps {
  title: string;
  publicationYear: number | string;
  totalEmails: number;
  isEnhanced: boolean;
  isEnhancing: boolean;
  onEnhanceEmails: () => void;
  onOpenPaper: () => void;
}

const PaperDetailHeader = ({
  title,
  publicationYear,
  totalEmails,
  isEnhanced,
  isEnhancing,
  onEnhanceEmails,
  onOpenPaper
}: PaperDetailHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            {title}
          </h1>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3" />
              <span>{publicationYear}</span>
            </Badge>
            {(isEnhanced || isEnhancing) && (
              <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                <Mail className="h-3 w-3" />
                <span>{isEnhancing ? 'Enhancing...' : `${totalEmails} emails found`}</span>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onOpenPaper}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Paper</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaperDetailHeader;
