
import { Download, FileText, Mail, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paper } from '../types/paper';
import PaperCard from './PaperCard';
import LoadingSkeleton from './LoadingSkeleton';
import { useEnhancedAuthors } from '../hooks/useEnhancedAuthors';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface EnhancedPaper extends Omit<Paper, 'authors'> {
  authors: EnhancedAuthor[];
}

interface ResultsSectionProps {
  papers: Paper[];
  loading: boolean;
  searchQuery: string;
  totalResults: number;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasMoreResults: boolean;
}

const ResultsSection = ({ papers, loading, searchQuery, totalResults, onLoadMore, loadingMore, hasMoreResults }: ResultsSectionProps) => {
  const [enhancedPapers, setEnhancedPapers] = useState<EnhancedPaper[]>([]);
  const [autoEnhancing, setAutoEnhancing] = useState(false);
  const { enhanceAuthorsWithEmails } = useEnhancedAuthors();

  // Auto-enhance emails when papers change
  useEffect(() => {
    const autoEnhanceEmails = async () => {
      if (papers.length === 0) {
        setEnhancedPapers([]);
        return;
      }

      setAutoEnhancing(true);
      try {
        console.log('Auto-enhancing emails for all papers...');
        const enhanced = await Promise.all(
          papers.map(paper => enhanceAuthorsWithEmails(paper))
        );
        setEnhancedPapers(enhanced);
        console.log('Auto email enhancement completed');
      } catch (error) {
        console.error('Error auto-enhancing emails:', error);
        // Fallback to original papers if enhancement fails
        setEnhancedPapers([]);
      } finally {
        setAutoEnhancing(false);
      }
    };

    autoEnhanceEmails();
  }, [papers, enhanceAuthorsWithEmails]);

  const exportToCSV = () => {
    const papersToExport = enhancedPapers.length > 0 ? enhancedPapers : papers;
    const headers = ['Title', 'DOI', 'Authors', 'Author Emails', 'Email Sources', 'Email Confidence', 'Publication Year', 'URL'];
    const csvContent = [
      headers.join(','),
      ...papersToExport.map(paper => [
        `"${paper.title.replace(/"/g, '""')}"`,
        paper.doi,
        `"${paper.authors.map(a => a.name).join('; ')}"`,
        `"${paper.authors.filter(a => a.email).map(a => a.email).join('; ')}"`,
        `"${paper.authors.map(a => (a as EnhancedAuthor).source || 'unknown').join('; ')}"`,
        `"${paper.authors.map(a => (a as EnhancedAuthor).confidence || 0).join('; ')}"`,
        paper.publicationYear,
        paper.url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cureus-papers-enhanced-${searchQuery}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (papers.length === 0) {
    return null;
  }

  const papersToDisplay = enhancedPapers.length > 0 ? enhancedPapers : papers;
  const totalEmails = papersToDisplay.reduce((sum, paper) => 
    sum + paper.authors.filter(author => author.email).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Search Results for "{searchQuery}"
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-600">
              Found {totalResults.toLocaleString()} papers • Showing {papers.length} results
            </p>
            {(enhancedPapers.length > 0 || autoEnhancing) && (
              <p className="text-blue-600 font-medium">
                {autoEnhancing ? 'Enhancing emails...' : `${totalEmails} author emails found`}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {autoEnhancing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Auto-enhancing...</span>
            </div>
          )}
          
          <Button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Enhancement Status */}
      {enhancedPapers.length > 0 && !autoEnhancing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Mail className="h-5 w-5" />
            <span className="font-medium">Email Enhancement Complete</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Authors have been automatically enhanced with additional email data from our database and scraping services.
          </p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-6">
        {papersToDisplay.map((paper, index) => (
          <PaperCard 
            key={`${paper.doi}-${index}`} 
            paper={paper}
            enhancedAuthors={enhancedPapers.length > 0 ? paper.authors : undefined}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMoreResults && (
        <div className="text-center py-8">
          <Button 
            onClick={onLoadMore} 
            disabled={loadingMore}
            variant="outline" 
            size="lg" 
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading More...</span>
              </div>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Load More Results
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
