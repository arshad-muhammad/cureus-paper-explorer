
import { ExternalLink, Calendar, Users, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paper } from '../types/paper';

interface PaperCardProps {
  paper: Paper;
}

const PaperCard = ({ paper }: PaperCardProps) => {
  const handleOpenPaper = () => {
    window.open(paper.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Year */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
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
          {paper.authors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                <span>Authors ({paper.authors.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {paper.authors.slice(0, 6).map((author, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-900">{author.name}</span>
                    {author.email && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{author.email}</span>
                      </div>
                    )}
                  </div>
                ))}
                {paper.authors.length > 6 && (
                  <span className="text-sm text-gray-500 italic">
                    +{paper.authors.length - 6} more authors
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Click to view full paper
            </div>
            <Button 
              onClick={handleOpenPaper}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Paper</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
