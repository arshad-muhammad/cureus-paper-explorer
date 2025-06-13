
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Mail, ExternalLink, Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paper } from '../types/paper';

const PaperDetail = () => {
  const { doi } = useParams<{ doi: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      if (!doi) return;
      
      setLoading(true);
      try {
        const decodedDoi = decodeURIComponent(doi);
        const response = await fetch(`https://api.crossref.org/works/${decodedDoi}`);
        const data = await response.json();
        
        const item = data.message;
        const formattedPaper: Paper = {
          title: item.title?.[0] || 'No title available',
          doi: item.DOI,
          authors: item.author?.map((author: any) => ({
            name: `${author.given || ''} ${author.family || ''}`.trim(),
            email: author.email || null
          })) || [],
          publicationYear: item.published?.['date-parts']?.[0]?.[0] || 
                          item.created?.['date-parts']?.[0]?.[0] || 'Unknown',
          url: item.URL || `https://doi.org/${item.DOI}`
        };
        
        setPaper(formattedPaper);
      } catch (error) {
        console.error('Error fetching paper details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaperDetails();
  }, [doi]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={handleBack} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <Card className="shadow-xl border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 leading-tight mb-4">
                  {paper.title}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
                    <Calendar className="h-3 w-3" />
                    <span>{paper.publicationYear}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Cureus Journal</span>
                  </Badge>
                </div>
              </div>
              <Button onClick={handleOpenPaper} className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Paper
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* DOI Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Digital Object Identifier (DOI)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <code className="text-sm font-mono text-gray-800">{paper.doi}</code>
              </div>
            </div>

            {/* Authors Section */}
            {paper.authors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Authors ({paper.authors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paper.authors.map((author, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">{author.name}</h4>
                          {author.email ? (
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              <Mail className="h-4 w-4" />
                              <a 
                                href={`mailto:${author.email}`}
                                className="hover:underline"
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
                  ))}
                </div>
              </div>
            )}

            {/* Publication Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Publication Details</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Journal</label>
                    <p className="text-gray-900">Cureus Journal of Medical Science</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Publication Year</label>
                    <p className="text-gray-900">{paper.publicationYear}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">DOI URL</label>
                    <p className="text-blue-600 hover:underline">
                      <a href={paper.url} target="_blank" rel="noopener noreferrer">
                        {paper.url}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
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
