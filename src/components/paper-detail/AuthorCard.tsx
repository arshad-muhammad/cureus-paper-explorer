
import { Mail, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface AuthorCardProps {
  author: EnhancedAuthor;
  isEnhanced: boolean;
}

const AuthorCard = ({ author, isEnhanced }: AuthorCardProps) => {
  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    if (confidence >= 0.8) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Shield className="h-3 w-3 mr-1" />
          High
        </Badge>
      );
    } else if (confidence >= 0.5) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Medium
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Low
        </Badge>
      );
    }
  };

  const getSourceBadge = (source?: string) => {
    const sourceLabels = {
      'crossref': 'CrossRef',
      'scraped': 'Scraped',
      'generated': 'Generated',
      'manual': 'Manual',
      'cached': 'Cached'
    };

    if (!source) return null;

    return (
      <Badge variant="outline" className="text-xs">
        {sourceLabels[source as keyof typeof sourceLabels] || source}
      </Badge>
    );
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{author.name}</h4>
            {isEnhanced && author.source && (
              <div className="flex space-x-1">
                {getSourceBadge(author.source)}
                {getConfidenceBadge(author.confidence)}
              </div>
            )}
          </div>
          {author.email ? (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${author.email}`}
                className="hover:underline break-all"
              >
                {author.email}
              </a>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span>Email not available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorCard;
