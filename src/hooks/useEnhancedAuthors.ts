import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Paper } from '@/types/paper';

interface EnhancedAuthor {
  name: string;
  email?: string | null;
  source?: string;
  confidence?: number;
}

interface EnhancedPaper extends Omit<Paper, 'authors'> {
  authors: EnhancedAuthor[];
}

// Function to generate synthetic email from author name
const generateSyntheticEmail = (authorName: string): string => {
  // Clean and format the name
  const nameParts = authorName.toLowerCase().trim().split(/\s+/);
  if (nameParts.length === 0) return 'author@email.com';
  
  // Remove any special characters and keep only letters
  const cleanName = (name: string) => name.replace(/[^a-z]/g, '');
  
  let emailPrefix = '';
  
  if (nameParts.length === 1) {
    // Single name - use as is
    emailPrefix = cleanName(nameParts[0]);
  } else if (nameParts.length === 2) {
    // First and last name - use firstname.lastname format
    const firstName = cleanName(nameParts[0]);
    const lastName = cleanName(nameParts[1]);
    emailPrefix = `${firstName}.${lastName}`;
  } else {
    // Multiple names - use first and last
    const firstName = cleanName(nameParts[0]);
    const lastName = cleanName(nameParts[nameParts.length - 1]);
    emailPrefix = `${firstName}.${lastName}`;
  }
  
  // Fallback if cleaning resulted in empty string
  if (!emailPrefix) {
    emailPrefix = 'author';
  }
  
  // Use a generic domain for synthetic emails
  return `${emailPrefix}@cureus-author.com`;
};

export const useEnhancedAuthors = () => {
  const [loading, setLoading] = useState(false);

  const enhanceAuthorsWithEmails = async (paper: Paper): Promise<EnhancedPaper> => {
    setLoading(true);
    try {
      console.log(`Enhancing authors for paper: ${paper.doi}`);

      // First, check if we have cached data for these authors
      const authorNames = paper.authors.map(a => a.name);
      const { data: cachedEmails } = await supabase
        .from('author_emails')
        .select('author_name, email, source, confidence_score')
        .in('author_name', authorNames);

      console.log(`Found ${cachedEmails?.length || 0} cached emails`);

      // Create a map of cached emails
      const emailMap = new Map();
      cachedEmails?.forEach(cached => {
        emailMap.set(cached.author_name, {
          email: cached.email,
          source: cached.source,
          confidence: cached.confidence_score
        });
      });

      // Check if we need to scrape more emails
      const authorsNeedingScraping = paper.authors.filter(author => 
        !author.email && !emailMap.has(author.name)
      );

      if (authorsNeedingScraping.length > 0) {
        console.log(`Scraping emails for ${authorsNeedingScraping.length} authors`);
        
        // Call the edge function to scrape emails
        const { data: scrapeResult, error } = await supabase.functions.invoke(
          'scrape-author-emails',
          {
            body: {
              doi: paper.doi,
              authors: paper.authors
            }
          }
        );

        if (error) {
          console.error('Error calling scrape function:', error);
        } else if (scrapeResult?.success) {
          console.log(`Scraping completed. Found ${scrapeResult.emailsFound} emails`);
          
          // Update the email map with new results
          scrapeResult.authors?.forEach((author: EnhancedAuthor) => {
            if (author.email) {
              emailMap.set(author.name, {
                email: author.email,
                source: author.source,
                confidence: author.confidence
              });
            }
          });
        }
      }

      // Enhance the paper authors with email data
      const enhancedAuthors: EnhancedAuthor[] = paper.authors.map(author => {
        const cachedData = emailMap.get(author.name);
        let email = author.email || cachedData?.email;
        let source = cachedData?.source || (author.email ? 'crossref' : undefined);
        let confidence = cachedData?.confidence || (author.email ? 1.0 : 0.0);
        
        // Generate synthetic email if no real email is available
        if (!email) {
          email = generateSyntheticEmail(author.name);
          source = 'generated';
          confidence = 0.1; // Low confidence for generated emails
        }
        
        return {
          name: author.name,
          email,
          source,
          confidence
        };
      });

      return {
        ...paper,
        authors: enhancedAuthors
      };

    } catch (error) {
      console.error('Error enhancing authors:', error);
      // Even in error case, generate synthetic emails
      return {
        ...paper,
        authors: paper.authors.map(author => ({
          name: author.name,
          email: author.email || generateSyntheticEmail(author.name),
          source: author.email ? 'crossref' : 'generated',
          confidence: author.email ? 1.0 : 0.1
        }))
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    enhanceAuthorsWithEmails,
    loading
  };
};
