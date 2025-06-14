
import { useState, useEffect } from 'react';
import { Paper } from '@/types/paper';

export const usePaperDetails = (doi: string | undefined) => {
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

  return { paper, loading };
};
