
import { Calendar, BookOpen, Mail, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <CardTitle className="text-2xl font-bold text-gray-900 leading-tight mb-4">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
            <Calendar className="h-3 w-3" />
            <span>{publicationYear}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <BookOpen className="h-3 w-3" />
            <span>Cureus Journal</span>
          </Badge>
          {isEnhanced && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Mail className="h-3 w-3 mr-1" />
              {totalEmails} emails found
            </Badge>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        {!isEnhanced && (
          <Button
            onClick={onEnhanceEmails}
            disabled={isEnhancing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isEnhancing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enhancing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Enhance Emails
              </>
            )}
          </Button>
        )}
        <Button onClick={onOpenPaper} className="bg-blue-600 hover:bg-blue-700">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Paper
        </Button>
      </div>
    </div>
  );
};

export default PaperDetailHeader;
