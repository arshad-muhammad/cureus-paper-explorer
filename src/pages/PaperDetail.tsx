
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEnhancedAuthors } from '../hooks/useEnhancedAuthors';
import { usePaperDetails } from '../hooks/usePaperDetails';
import PaperDetailHeader from '../components/paper-detail/PaperDetailHeader';
import EnhancementStatus from '../components/paper-detail/EnhancementStatus';
import DOISection from '../components/paper-detail/DOISection';
import AuthorsSection from '../components/paper-detail/AuthorsSection';
import PublicationDetails from '../components/paper-detail/PublicationDetails';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface EnhancedPaper {
  title: string;
  doi: string;
  authors: EnhancedAuthor[];
  publicationYear: number | string;
  url: string;
}

const PaperDetail = () => {
  const { doi } = useParams<{ doi: string }>();
  const navigate = useNavigate();
  const [enhancedPaper, setEnhancedPaper] = useState<EnhancedPaper | null>(null);
  const [enhancingEmails, setEnhancingEmails] = useState(false);
  const { paper, loading } = usePaperDetails(doi);
  const { enhanceAuthorsWithEmails } = useEnhancedAuthors();

  const handleEnhanceEmails = async () => {
    if (!paper) return;
    
    setEnhancingEmails(true);
    try {
      console.log('Enhancing emails for paper:', paper.doi);
      const enhanced = await enhanceAuthorsWithEmails(paper);
      setEnhancedPaper(enhanced);
      console.log('Email enhancement completed');
    } catch (error) {
      console.error('Error enhancing emails:', error);
    } finally {
      setEnhancingEmails(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleOpenPaper = () => {
    if (paper) {
      window.open(paper.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={handleBack} variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Paper not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayAuthors = enhancedPaper ? enhancedPaper.authors : paper.authors;
  const totalEmails = displayAuthors.filter(author => author.email).length;
  const isEnhanced = !!enhancedPaper;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={handleBack} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <Card className="shadow-xl border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <PaperDetailHeader
              title={paper.title}
              publicationYear={paper.publicationYear}
              totalEmails={totalEmails}
              isEnhanced={isEnhanced}
              isEnhancing={enhancingEmails}
              onEnhanceEmails={handleEnhanceEmails}
              onOpenPaper={handleOpenPaper}
            />
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <EnhancementStatus isEnhanced={isEnhanced} />

            <DOISection doi={paper.doi} />

            <AuthorsSection 
              authors={displayAuthors} 
              isEnhanced={isEnhanced}
            />

            <PublicationDetails 
              publicationYear={paper.publicationYear}
              url={paper.url}
            />

            <div className="flex justify-center pt-6 border-t">
              <Button onClick={handleOpenPaper} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-5 w-5 mr-2" />
                Read Full Paper
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaperDetail;
