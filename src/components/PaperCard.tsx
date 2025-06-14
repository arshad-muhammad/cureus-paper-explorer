
import { ExternalLink, Calendar, Users, Mail, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paper } from '../types/paper';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface PaperCardProps {
  paper: Paper;
  enhancedAuthors?: EnhancedAuthor[];
}

const PaperCard = ({ paper, enhancedAuthors }: PaperCardProps) => {
  const navigate = useNavigate();
  const authors = enhancedAuthors || paper.authors;

  const handleViewDetails = () => {
    const encodedDoi = encodeURIComponent(paper.doi);
    navigate(`/paper/${encodedDoi}`);
  };

  const handleOpenPaper = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(paper.url, '_blank', 'noopener,noreferrer');
  };

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
    <Card 
      className="hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 cursor-pointer"
      onClick={handleViewDetails}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Year */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 hover:text-blue-600 transition-colors">
              {paper.title}
            </h3>
            <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3" />
              <span>{paper.publicationYear}</span>
            </Badge>
          </div>

          {/* DOI */}
          <div className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg">
            DOI: {paper.doi}
          </div>

          {/* Authors */}
          {authors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                <span>Authors ({authors.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {authors.slice(0, 4).map((author, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium">{author.name}</span>
                        {(author as EnhancedAuthor).source && getSourceBadge((author as EnhancedAuthor).source)}
                      </div>
                      {author.email ? (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{author.email}</span>
                          {(author as EnhancedAuthor).confidence && getConfidenceBadge((author as EnhancedAuthor).confidence)}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">Email not available</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {authors.length > 4 && (
                  <span className="text-sm text-gray-500 italic pl-3">
                    +{authors.length - 4} more authors
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Click to view details or open paper
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleOpenPaper}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Paper</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
