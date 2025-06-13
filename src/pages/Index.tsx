
import { useState } from 'react';
import { Search, BookOpen, Zap, Download } from 'lucide-react';
import SearchSection from '../components/SearchSection';
import ResultsSection from '../components/ResultsSection';
import { Paper } from '../types/paper';

const Index = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);

  const RESULTS_PER_PAGE = 20;

  const fetchPapers = async (query: string, page: number = 1, append: boolean = false) => {
    const offset = (page - 1) * RESULTS_PER_PAGE;
    
    try {
      const response = await fetch(
        `https://api.crossref.org/journals/2168-8184/works?query=${encodeURIComponent(query)}&rows=${RESULTS_PER_PAGE}&offset=${offset}`
      );
      const data = await response.json();
      
      const formattedPapers: Paper[] = data.message.items.map((item: any) => ({
        title: item.title?.[0] || 'No title available',
        doi: item.DOI,
        authors: item.author?.map((author: any) => ({
          name: `${author.given || ''} ${author.family || ''}`.trim(),
          email: author.email || null
        })) || [],
        publicationYear: item.published?.['date-parts']?.[0]?.[0] || 
                        item.created?.['date-parts']?.[0]?.[0] || 'Unknown',
        url: item.URL || `https://doi.org/${item.DOI}`
      }));
      
      if (append) {
        setPapers(prev => [...prev, ...formattedPapers]);
      } else {
        setPapers(formattedPapers);
      }
      
      setTotalResults(data.message['total-results'] || 0);
      const totalFetched = append ? papers.length + formattedPapers.length : formattedPapers.length;
      setHasMoreResults(totalFetched < (data.message['total-results'] || 0));
      
    } catch (error) {
      console.error('Error fetching papers:', error);
      if (!append) {
        setPapers([]);
        setTotalResults(0);
        setHasMoreResults(false);
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchQuery(query);
    setCurrentPage(1);
    
    await fetchPapers(query, 1, false);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    if (!searchQuery || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    await fetchPapers(searchQuery, nextPage, true);
    setLoadingMore(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white shadow-sm border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cureus<span className="text-blue-600">Scope</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover, explore, and export research papers from the Cureus Journal. 
              Advanced search capabilities for medical and scientific literature.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Advanced Search</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700 font-medium">Real-time Results</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Download className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">CSV Export</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchSection onSearch={handleSearch} loading={loading} />
        
        {/* Results Section */}
        {(papers.length > 0 || loading) && (
          <ResultsSection 
            papers={papers} 
            loading={loading} 
            searchQuery={searchQuery}
            totalResults={totalResults}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
            hasMoreResults={hasMoreResults}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
