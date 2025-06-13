
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Paper } from '../types/paper';
import PaperCard from './PaperCard';
import LoadingSkeleton from './LoadingSkeleton';

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
  const exportToCSV = () => {
    const headers = ['Title', 'DOI', 'Authors', 'Author Emails', 'Publication Year', 'URL'];
    const csvContent = [
      headers.join(','),
      ...papers.map(paper => [
        `"${paper.title.replace(/"/g, '""')}"`,
        paper.doi,
        `"${paper.authors.map(a => a.name).join('; ')}"`,
        `"${paper.authors.filter(a => a.email).map(a => a.email).join('; ')}"`,
        paper.publicationYear,
        paper.url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cureus-papers-${searchQuery}-${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Search Results for "{searchQuery}"
          </h3>
          <p className="text-gray-600 mt-1">
            Found {totalResults.toLocaleString()} papers • Showing {papers.length} results
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-6">
        {papers.map((paper, index) => (
          <PaperCard key={`${paper.doi}-${index}`} paper={paper} />
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
